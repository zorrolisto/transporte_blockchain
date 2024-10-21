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
  const [idSearch, setIdSearch] = useState("");

  const [contract, setContract] = useState<ethers.Contract | null>(null);

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

  if (session.status === "loading") {
    return null;
  }

  const obtenerDataFromBlockchain = async (id: number) => {
    if (!contract) {
      return alertError("El contrato no está inicializado");
    }
    alertLoading("Obteniendo");

    try {
      const data = await contract.getShipNameById(id);
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
  const isAdmin = session.data?.user.id === "1";
  console.log("isAdmin", isAdmin);

  return (
    <>
      <div className="mx-auto flex max-w-7xl justify-between px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight text-blue-900 sm:grow-0">
          Verificar Embarque
        </h1>
      </div>
      <main>
        <div className="flex items-center justify-between px-8">
          <Input
            placeholder="Buscar embarcación por id"
            value={idSearch}
            onChange={(e) => setIdSearch(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                console.log("Buscar embarcación por id", idSearch);
                obtenerDataFromBlockchain(Number(idSearch.trim()));
              }
            }}
          />
        </div>
      </main>
    </>
  );
}
