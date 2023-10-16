import { ReactNode } from "react";

interface IFormModal {
  title: string;
  children: ReactNode;
 style: string;
}

export default function ModalForm(props: IFormModal) {
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden font-montserrat outline-none focus:outline-none">
        <div className="relative mx-auto my-6 w-auto">
          <div className={`relative flex ${props.style} flex-col rounded-lg border-0  bg-white shadow-lg outline-none focus:outline-none`}>
            <div className="flex items-start justify-between rounded-t border-b border-solid border-slate-200 p-5">
              <h3 className="text-3xl font-semibold">{props.title}</h3>
              <button className="float-right ml-auto border-0 bg-transparent p-1 text-3xl font-semibold leading-none text-black opacity-5 outline-none focus:outline-none"></button>
            </div>
            <div className="relative flex-auto flex-col p-6">
              {props.children}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
    </>
  );
}
