import Swal from "sweetalert2";

export const contractAddress = "0x79E909c06f1b44dF6A1C7A6F6e5ff69fC212A8e1";

export const fileStorageABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "addShip",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "getShipNameById",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

//---

export const adminImage =
  "https://www.svgrepo.com/show/382096/female-avatar-girl-face-woman-user.svg";
export const userImage =
  "https://www.svgrepo.com/show/382109/male-avatar-boy-face-man-user-7.svg";

export const alertError = (message: string) => {
  Swal.fire({ title: "Algo salió mal", text: message });
};
export const alertSuccess = (message: string) => {
  Swal.fire({ title: "Hecho", text: message });
};
export const alertLoading = (message: string) => {
  Swal.fire({
    title: "Transaccionando...",
    text: "",
    showConfirmButton: false,
  });
};
