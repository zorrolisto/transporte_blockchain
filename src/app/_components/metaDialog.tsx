"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const formFields = [
  {
    label: "Nombre",
    type: "text",
    field: "name",
  },
  {
    label: "Tokens",
    type: "number",
    field: "tokens",
  },
  {
    label: "Meta",
    type: "number",
    field: "goal",
  },
  {
    label: "Unidad",
    type: "text",
    field: "unit",
  },
  {
    label: "Avance",
    type: "number",
    field: "avance",
  },
];
export default function MetaDialog({
  open,
  setOpen,
  meta,
  guardarMeta,
  usuarios,
}: any) {
  const [metaAux, setMetaAux] = useState(meta);

  useEffect(() => {
    setMetaAux(meta);
  }, [meta]);

  if (!metaAux) {
    return null;
  }
  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <form
              action={async () => {
                await guardarMeta(metaAux);
              }}
            >
              <div className="sm:flex sm:items-start">
                <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <div className="mt-2">
                    <div className="grid w-full grid-cols-2 gap-4">
                      {formFields.map((field, idx) => (
                        <div key={idx}>
                          <label
                            htmlFor={field.field}
                            className="block text-xs font-medium leading-6 text-gray-900"
                          >
                            {field.label}
                          </label>
                          <div className="mt-0">
                            <input
                              id={field.field}
                              name={field.field}
                              type={field.type}
                              value={metaAux[field.field]}
                              onChange={(e) =>
                                setMetaAux({
                                  ...metaAux,
                                  [field.field]: e.target.value,
                                })
                              }
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xs sm:leading-6"
                            />
                          </div>
                        </div>
                      ))}
                      <div>
                        <label
                          htmlFor="userId"
                          className="block text-xs font-medium leading-6 text-gray-900"
                        >
                          Colaborador
                        </label>
                        <div className="mt-0">
                          <select
                            id="userId"
                            name="userId"
                            value={metaAux.userId}
                            onChange={(e) => {
                              setMetaAux({
                                ...metaAux,
                                userId: e.target.value,
                              });
                            }}
                            className="block w-full rounded-md border-0 px-3 py-1.5 text-xs text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:leading-6"
                          >
                            <option value="-">Seleccione un usuario</option>
                            {usuarios.map((option: any) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 justify-center sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
