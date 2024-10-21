import { BanknotesIcon } from "@heroicons/react/24/outline";

export const C_RECOMPENSAS = [
  {
    id: 1,
    name: "Día Libre",
    title: "Ten un día libre para descansar",
    dispo: "Disponible",
    price: 500,
  },
  {
    id: 2,
    name: "Capacitación Excel",
    title: "Capacitación con un experto en Excel",
    dispo: "Disponible",
    price: 150,
  },
  {
    id: 3,
    name: "Un día más",
    title: "Añade un día más a tus vacaciones",
    dispo: "Disponible",
    price: 500,
  },
];

export default function RecompensasGrid({ comprarRecompensa }: any) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {C_RECOMPENSAS.map((recompensa, idx) => (
        <li
          key={idx}
          className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
        >
          <div className="flex w-full items-center justify-between space-x-6 p-6">
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <h3 className="truncate text-sm font-medium text-gray-900">
                  {recompensa.name}
                </h3>
                <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {recompensa.dispo}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-gray-500">
                {recompensa.title}
              </p>
            </div>
            <button
              onClick={() => {
                comprarRecompensa(recompensa);
              }}
              className="flex h-10 flex-shrink-0 items-center justify-center rounded-full px-4 text-blue-500 ring-2 ring-blue-500"
            >
              <BanknotesIcon className="mr-2 h-6 w-6" />
              {recompensa.price}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
