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
    label: "Fruto",
    type: "text",
    field: "fruto",
  },
  {
    label: "N° Gramos * Clamshell",
    type: "number",
    field: "gramosPorClamshell",
  },
  {
    label: "N° Clamshells * Caja",
    type: "number",
    field: "clamshellsPorCaja",
  },
  {
    label: "N° Cajas * Pallet",
    type: "number",
    field: "cajasPorPallet",
  },
  {
    label: "N° Pallets",
    type: "number",
    field: "palletsPorContainer",
  },
];

export default function Home() {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<any>(null);

  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const [allContainers] = api.containers.getAllContainers.useSuspenseQuery();

  const utils = api.useUtils();

  const saveContainer = api.containers.saveContainer.useMutation({
    onSuccess: async () => await utils.containers.invalidate(),
    onError: (error: any) => alertError(error.message),
  });
  const eliminarCont = api.containers.eliminarContainer.useMutation({
    onSuccess: async () => await utils.containers.invalidate(),
    onError: (error: any) => alertError(error.message),
  });
  const createTransaction = api.transactions.create.useMutation({
    onSuccess: async () => await utils.transactions.invalidate(),
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

  const reclamarRecompensa = async (unit: any) => {
    if (!unit || !contract) return;

    alertLoading("Transacción en proceso");

    const transactionHash = await createTransactionBlockchain({ ...unit });
    if (!transactionHash) return alertError("Error al subir la información");

    createTransaction.mutate({
      hashT: transactionHash,
      unitId: unit.id,
    });
    alertSuccess("Tokens reclamados correctamente");
  };
  const editarContainer = (cont: any) => {
    console.log("Editar cont", cont);
    setOpen(true);
    setContainer(cont);
  };
  const eliminarContainer = (cont: any) => {
    Swal.fire({
      title: "¿Estás seguro de terminar el container?",
      text: "Una vez eliminado no se podrá recuperar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    }).then((result: any) => {
      if (result.isConfirmed) {
        eliminarCont.mutate({ id: Number(cont.id) });
      }
    });
  };
  const guardarContainer = (cont: any) => {
    console.log("Guardar cont", cont);
    saveContainer.mutate({
      id: cont.id ? cont.id : undefined,
      fruto: cont.fruto,
      gramosPorClamshell: Number(cont.gramosPorClamshell),
      clamshellsPorCaja: Number(cont.clamshellsPorCaja),
      cajasPorPallet: Number(cont.cajasPorPallet),
      palletsPorContainer: Number(cont.palletsPorContainer),
      fechaEmpaquetacion: cont.fechaEmpaquetacion,
    });
    setOpen(false);
    alertSuccess("Guardado!!!");
  };
  const createTransactionBlockchain = async ({ name, tokens }: any) => {
    if (!contract) return null;
    try {
      console.log("name, tokens", name, tokens);
      const tx = await contract.addToken(name, tokens);
      const receipt = await tx.wait();

      console.log("Receipt", receipt);
      return receipt.transactionHash;
    } catch (error) {
      alertError("Error al subir los tokens");
    }
    return null;
  };
  const obtenerTokensFromBlockchain = async (unit: any) => {
    if (!contract) {
      return alertError("El contrato no está inicializado");
    }
    alertLoading("Obteniendo");

    try {
      const metaTokensFromBlockchain = await contract.getToken(unit.placa);
      console.log("metaTokensFromBlockchain", metaTokensFromBlockchain);
      alertSuccess(`Esta unit trajo ${metaTokensFromBlockchain} tokens.`);
    } catch (error: any) {
      alertError("Error al obtener los tokens");
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

  const openModalToCreateContainer = () => {
    setOpen(true);
    setContainer({
      fruto: "",
      gramosPorClamshell: "",
      clamshellsPorCaja: "",
      cajasPorPallet: "",
      palletsPorContainer: "",
      fechaEmpaquetacion: new Date(),
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
          Containers
        </h1>

        <Button
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => openModalToCreateContainer()}
        >
          Añadir
        </Button>
      </div>
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card x-chunk="dashboard-05-chunk-0" className="bg-white shadow-lg">
            <CardHeader className="bg-blue-100 pb-3">
              <CardDescription className="max-w-lg text-balance leading-relaxed text-blue-900">
                Estos son todos los containers existentes
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
                      Fruto
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-blue-900">
                      Gr X Clamshell
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-blue-900">
                      Clamshell X Caja
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-blue-900">
                      Cajas X Pallet
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-blue-900">
                      Pallets X Container
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-blue-900">
                      Fecha Empaquetación
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-blue-900">
                      Enviado
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allContainers.map((cont) => (
                    <TableRow key={cont.id}>
                      <TableCell className="text-gray-700">{cont.id}</TableCell>
                      <TableCell className="text-gray-700">
                        {cont.fruto}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {cont.gramosPorClamshell}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {cont.clamshellsPorCaja}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {cont.cajasPorPallet}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {cont.palletsPorContainer}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {cont.fechaEmpaquetacion.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {cont.embarcacionId ? "Sí" : "No"}
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
                              onClick={() => editarContainer(cont)}
                              className="text-blue-900"
                            >
                              Editar
                            </DropdownMenuItem>
                            {!cont.embarcacionId && (
                              <DropdownMenuItem
                                onClick={() => eliminarContainer(cont.id)}
                                className="text-blue-900"
                              >
                                Eliminar
                              </DropdownMenuItem>
                            )}
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
            title="Guardar Container"
          >
            {container && (
              <form
                action={async () => {
                  guardarContainer(container);
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
                                value={container[field.field]}
                                onChange={(e) =>
                                  setContainer({
                                    ...container,
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
                            Fecha Empaquetación
                          </label>
                          <div className="mt-0">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left text-xs font-normal text-blue-900",
                                    !container.fechaEmpaquetacion &&
                                      "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 text-blue-900" />
                                  {container.fechaEmpaquetacion ? (
                                    format(container.fechaEmpaquetacion, "PPP")
                                  ) : (
                                    <span>Elige fecha</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto bg-white p-0 shadow-lg">
                                <Calendar
                                  mode="single"
                                  selected={container.fechaEmpaquetacion}
                                  onSelect={(date) =>
                                    date &&
                                    setContainer({
                                      ...container,
                                      fechaEmpaquetacion: date,
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
