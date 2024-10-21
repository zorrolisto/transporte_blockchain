import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";

const statuses: Record<"Paid" | "Withdraw" | "Overdue", string> = {
  Paid: "text-green-700 bg-green-50 ring-green-600/20",
  Withdraw: "text-gray-600 bg-gray-50 ring-gray-500/10",
  Overdue: "text-red-700 bg-red-50 ring-red-600/10",
};

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function CardsGrid({
  metas,
  session,
  users,
  reclamarRecompensa,
  acabarMeta,
  obtenerTokensFromBlockchain,
  editarMeta,
  isAdmin,
}: any) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
    >
      {metas.map((meta: any) => (
        <li
          key={meta.id}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <div className="flex items-center gap-x-4 border-b border-gray-900/5 p-6">
            <span
              className={`flex h-10 w-fit items-center justify-center rounded-lg px-2 text-xs ring-1 ring-gray-900/10 ${
                meta.avance === 100
                  ? "bg-green-500 text-white"
                  : meta.avance >= 75
                    ? "bg-blue-500 text-white"
                    : meta.avance >= 50
                      ? "bg-yellow-500 text-black"
                      : meta.avance >= 25
                        ? "bg-orange-500 text-black"
                        : "bg-red-500 text-white"
              }`}
            >
              {meta.avance} %
            </span>

            <div className="text-xs font-medium leading-6 text-gray-900">
              {meta.name}
            </div>
            {((isAdmin && meta.avance !== 100) ||
              (isAdmin && meta.isClaim && meta.avance === 100) ||
              (!isAdmin && meta.avance === 100 && meta.isClaim) ||
              (!isAdmin && !meta.isClaim && meta.avance === 100)) && (
              <Menu as="div" className="relative ml-auto">
                <MenuButton className="-m-2.5 block p-2.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Open options</span>
                  <EllipsisHorizontalIcon
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  {(isAdmin && !meta.isClaim && meta.avance !== 100) ||
                  (!isAdmin && meta.avance === 100 && !meta.isClaim) ? (
                    <MenuItem>
                      {!isAdmin ? (
                        <button
                          onClick={() => reclamarRecompensa(meta)}
                          className="block w-full px-3 py-1 text-xs leading-6 text-gray-900 data-[focus]:bg-gray-50"
                        >
                          Reclamar Tokens
                        </button>
                      ) : (
                        <button
                          onClick={() => acabarMeta(meta)}
                          className="block w-full px-3 py-1 text-xs leading-6 text-gray-900 data-[focus]:bg-gray-50"
                        >
                          Terminar
                        </button>
                      )}
                    </MenuItem>
                  ) : meta.isClaim ? (
                    <MenuItem>
                      <button
                        onClick={() => obtenerTokensFromBlockchain(meta)}
                        className="block w-full px-3 py-1 text-xs leading-6 text-gray-900 data-[focus]:bg-gray-50"
                      >
                        Ver Tokens Reales
                      </button>
                    </MenuItem>
                  ) : null}

                  {isAdmin && meta.avance !== 100 && (
                    <MenuItem>
                      <button
                        onClick={() => editarMeta(meta)}
                        className="block w-full px-3 py-1 text-xs leading-6 text-gray-900 data-[focus]:bg-gray-50"
                      >
                        Editar
                      </button>
                    </MenuItem>
                  )}
                </MenuItems>
              </Menu>
            )}
          </div>
          <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-xs leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Meta</dt>
              <dd className="text-gray-700">
                <div className="max-w-28 overflow-hidden text-ellipsis whitespace-nowrap">
                  {meta.goal} {meta.unit}
                </div>
              </dd>
            </div>
            {session.data?.user.id === "1" && (
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Colaborador</dt>
                <dd className="text-gray-700">
                  <div className="max-w-28 overflow-hidden text-ellipsis whitespace-nowrap">
                    {(users || []).find((u: any) => u?.id === meta.userId)
                      ?.name || "Unknown"}
                  </div>
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Hash</dt>
              <dd className="text-gray-700">
                <div className="max-w-28 overflow-hidden text-ellipsis whitespace-nowrap">
                  {meta.isClaim ? meta.hash : "No generado"}
                </div>
              </dd>
            </div>
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Tokens</dt>
              <dd className="flex items-start gap-x-2">
                <div className="font-medium text-gray-900">{meta.tokens}</div>
                <div
                  className={classNames(
                    meta.isClaim
                      ? statuses["Paid"]
                      : !meta.isClaim && meta.avance < 100
                        ? statuses["Withdraw"]
                        : statuses["Overdue"],
                    "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                  )}
                >
                  {meta.isClaim
                    ? "Tokens reclamados"
                    : !meta.isClaim && meta.avance < 100
                      ? "En proceso"
                      : "Por reclamar"}
                </div>
              </dd>
            </div>
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Creado</dt>
              <dd className="text-gray-700">
                <time dateTime={meta.createdAt.toLocaleDateString()}>
                  {meta.createdAt.toLocaleDateString()}
                </time>
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
