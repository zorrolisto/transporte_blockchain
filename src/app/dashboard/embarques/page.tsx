"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { ethers } from "ethers";
import {
  alertError,
  alertLoading,
  alertSuccess,
  contractAddress,
  fileStorageABI,
} from "~/constants";
import { format, set } from "date-fns";
import Swal from "sweetalert2";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  CalendarIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { ResponsiveDialog } from "~/components/responsive-dialog";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";

declare global {
  interface Window {
    ethereum: any;
  }
}

const formFields = [
  {
    label: "Nombre Embarcación",
    type: "text",
    field: "nombre",
  },
  {
    label: "Días en Llegar",
    type: "number",
    field: "diasEnLlegar",
  },
  {
    label: "Pais Origen",
    type: "text",
    field: "paisOrigen",
  },
  {
    label: "Pais Destino",
    type: "text",
    field: "paisDestino",
  },
  {
    label: "Tipo De Envío",
    type: "text",
    field: "tipoDeEnvio",
  },
];

export default function Home() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [embarcacion, setEmbarcacion] = useState<any>(null);

  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const [allEmbarcaciones] =
    api.embarcaciones.getAllEmbarques.useSuspenseQuery();

  const utils = api.useUtils();

  const saveEmbarcacion = api.embarcaciones.saveEmbarque.useMutation({
    onSuccess: async (embarcacion: any) => {
      await makeTransaction(embarcacion[0]);
      setOpen(false);
      alertSuccess("Guardado!!!");
      await utils.embarcaciones.invalidate();
    },
    onError: (error: any) => alertError(error.message),
  });
  const eliminarEmbarcacion = api.embarcaciones.deleteEmbarcacion.useMutation({
    onSuccess: async () => await utils.transactions.invalidate(),
    onError: (error: any) => alertError(error.message),
  });
  const createTransaction = api.transactions.create.useMutation({
    onSuccess: async () => await utils.transactions.invalidate(),
    onError: (error: any) => alertError(error.message),
  });

  useEffect(() => {
    const initializeContract = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          // Solicitar acceso a la cuenta de MetaMask
          await window.ethereum.request({ method: "eth_requestAccounts" });

          // Crear un proveedor de ethers.js usando MetaMask
          const provider = new ethers.providers.Web3Provider(window.ethereum);

          const code = await provider.getCode(contractAddress);
          console.log("Código en la dirección:", code);

          // Obtener el signer de MetaMask
          const signer = provider.getSigner();

          // Inicializar el contrato con el ABI y la dirección del contrato
          const newContract = new ethers.Contract(
            contractAddress,
            fileStorageABI,
            signer,
          );

          // Establecer el contrato en el estado
          setContract(newContract);
        } catch (error) {
          console.error(
            "Error al inicializar el contrato con MetaMask:",
            error,
          );
        }
      } else {
        console.error("MetaMask no está instalado");
      }
    };

    initializeContract();
  }, []);

  const makeTransaction = async (emb: any) => {
    console.log("embarcación", emb);
    if (!emb || !contract) {
      console.log("No embarcación o contract");
      return;
    }

    alertLoading("Transacción en proceso");

    const transactionHash = await createTransactionBlockchain(emb);
    if (!transactionHash) return alertError("Error al subir la información");

    createTransaction.mutate({
      hashT: transactionHash,
      embarcacionId: emb.id,
    });
    alertSuccess("Tokens reclamados correctamente");
  };
  const guardarEmbarcacion = async (cont: any) => {
    console.log("Guardar cont", cont);
    saveEmbarcacion.mutate({
      id: cont.id ? cont.id : undefined,
      diasEnLlegar: Number(cont.diasEnLlegar),
      nombre: cont.nombre,
      paisOrigen: cont.paisOrigen,
      paisDestino: cont.paisDestino,
      tipoDeEnvio: cont.tipoDeEnvio,
      fechaEnvio: cont.fechaEnvio,
    });
  };
  const createTransactionBlockchain = async (emb: any) => {
    if (!contract) return null;
    try {
      console.log("emb", emb);
      console.log("nombre, id", emb.nombre, emb.id);
      const tx = await contract.addShip(emb.id, emb.nombre);
      const receipt = await tx.wait();

      console.log("Receipt", receipt);
      return receipt.transactionHash;
    } catch (error) {
      alertError("Error al subir el embarque");
      eliminarEmbarcacion.mutate({ id: Number(emb.id) });
    }
    return null;
  };
  const obtenerDataFromBlockchain = async (embarque: any) => {
    if (!contract) {
      return alertError("El contrato no está inicializado");
    }
    alertLoading("Obteniendo");

    try {
      const data = await contract.getShipNameById(embarque.id);
      console.log("data ", data);
      alertSuccess(`El nombre de tu embarcación es: ${data}`);
    } catch (error: any) {
      alertError("Error al obtener la data");
      if (error.message) {
        console.error("Razón del error:", error.message);
      }
      if (error.reason) {
        console.error("Razón del error:", error.reason);
      }
      if (error.data) {
        console.error("Datos adicionales del error:", error.data);
      }
    }
  };

  const openModalToCreateEmbarcacion = () => {
    setOpen(true);
    setEmbarcacion({
      nombre: "",
      diasEnLlegar: 0,
      paisOrigen: "Perú",
      paisDestino: "",
      tipoDeEnvio: "",
      fechaEnvio: new Date(),
    });
  };

  if (session.status === "loading") {
    return null;
  }
  const isAdmin = session.data?.user.id === "1";
  console.log("isAdmin", isAdmin);

  return (
    <>
      <div className="mx-auto flex max-w-7xl justify-between px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight text-blue-900 sm:grow-0">
          Embarcaciones
        </h1>

        <Button
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => openModalToCreateEmbarcacion()}
        >
          Añadir
        </Button>
      </div>
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card x-chunk="dashboard-05-chunk-0" className="bg-white shadow-lg">
            <CardHeader className="bg-blue-100 pb-3">
              <CardDescription className="max-w-lg text-balance leading-relaxed text-blue-900">
                Estos son todos los embarcaciones existentes
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Table className="bg-white">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] text-blue-900">
                      ID
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-blue-900">
                      Nombre Embarcación
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-blue-900">
                      Días En Llegar
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-blue-900">
                      País Origen
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-blue-900">
                      País Destino
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-blue-900">
                      Tipo De Envío
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-blue-900">
                      Fecha Envío
                    </TableHead>

                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEmbarcaciones.map((emb) => (
                    <TableRow key={emb.id}>
                      <TableCell className="text-gray-700">{emb.id}</TableCell>
                      <TableCell className="text-gray-700">
                        {emb.nombre}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {emb.diasEnLlegar}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {emb.paisOrigen}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {emb.paisDestino}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {emb.tipoDeEnvio}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {format(emb.fechaEnvio, "PPP")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <EllipsisHorizontalIcon className="h-4 w-4 text-blue-900" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white shadow-lg"
                          >
                            <DropdownMenuLabel className="text-blue-900">
                              Acciones
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => obtenerDataFromBlockchain(emb)}
                              className="text-blue-900"
                            >
                              Verificar embarque
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <ResponsiveDialog
            isOpen={open}
            setIsOpen={setOpen}
            title="Guardar Embarcacion"
          >
            {embarcacion && (
              <form
                action={async () => {
                  guardarEmbarcacion(embarcacion);
                }}
              >
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <div className="mt-2">
                      <div className="grid w-full grid-cols-2 gap-4">
                        {formFields.map((field, idx) => (
                          <div key={idx}>
                            <label
                              htmlFor={field.field}
                              className="block text-xs font-medium leading-6 text-blue-900"
                            >
                              {field.label}
                            </label>
                            <div className="mt-0">
                              <Input
                                id={field.field}
                                name={field.field}
                                type={field.type}
                                value={embarcacion[field.field]}
                                onChange={(e) =>
                                  setEmbarcacion({
                                    ...embarcacion,
                                    [field.field]: e.target.value,
                                  })
                                }
                                className="block w-full rounded-md border-0 py-1.5 text-blue-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-xs sm:leading-6"
                              />
                            </div>
                          </div>
                        ))}
                        <div>
                          <label className="block text-xs font-medium leading-6 text-blue-900">
                            Fecha Envio
                          </label>
                          <div className="mt-0">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left text-xs font-normal text-blue-900",
                                    !embarcacion.fechaEnvio &&
                                      "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 text-blue-900" />
                                  {embarcacion.fechaEnvio ? (
                                    format(embarcacion.fechaEnvio, "PPP")
                                  ) : (
                                    <span>Elige fecha</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto bg-white p-0 shadow-lg">
                                <Calendar
                                  mode="single"
                                  selected={embarcacion.fechaEnvio}
                                  onSelect={(date) =>
                                    date &&
                                    setEmbarcacion({
                                      ...embarcacion,
                                      fechaEnvio: date,
                                    })
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 justify-start sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-blue-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-600 sm:ml-3 sm:w-auto"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-xs font-semibold text-blue-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </ResponsiveDialog>
        </div>
      </main>
    </>
  );
}
