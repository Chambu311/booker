import { User } from "@prisma/client";
import {  useRef, useState } from "react";
import { useForm } from "react-hook-form";
import MdIcon from "../ui/mdIcon";
import { mdiEye, mdiPlus } from "@mdi/js";
import { api } from "~/utils/api";
import { toast, Toaster } from "react-hot-toast";
import { signOut } from "next-auth/react";

type UserFormValues = {
  email: string;
  password: string;
  name: string;
};

const ProfileSettings = (props: { user: User }) => {
  const { user } = props;
  const form = useForm<UserFormValues>({
    defaultValues: {
      name: user?.name,
      email: user?.email ?? "",
    },
  });
  const pictureRef = useRef(null) as any;
  const [passwordInputType, setPasswordInputType] = useState("password");
  const userMutation = api.user.updateUser.useMutation();
  const [picture, setPicture] = useState<File>();
  const [url, setUrl] = useState<string>(user.image ?? '');
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [edit, setEdit] = useState(false);
  const parseErrorMessage = (message: string) => {
    if (message.includes("Username")) {
      return "El nombre de usuario ingresado ya existe, seleccione otro";
    } else {
      return "Ya existe una cuenta registrada a ese email";
    }
  };

  const handleFileUploadchange = (e: any) => {
    const file = [...e.target.files].at(0);
    if (!file) return;

    setPicture(file);
    const url = URL.createObjectURL(file);
    setUrl(url);
  };

  const onSettingsSubmit = async (data: UserFormValues) => {
    toast.loading("Guardando...", {
      id: "loading",
    });

    let img = undefined;
    if (picture) {
      try {
        const formData = new FormData();
        formData.append("file", picture);

        const response = await fetch("/api/upload/pinata", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();
        console.log("result", result.url);
        img = result.url;
      } catch (error) {
        toast.dismiss("loading");
        toast.error("Error al subir la imagen");
        return;
      }
    }

    userMutation.mutate(
      {
        ...data,
        id: user.id,
        picture: img,
        isSettings: true,
      },
      {
        onSuccess: () => {
          toast.dismiss("loading");
          toast.success("Cambios guardados con exito");
          void signOut({ callbackUrl: "/" });
        },
        onError: (opts) => {
          toast.dismiss("loading");
          toast.error(parseErrorMessage(opts.message));
        },
      },
    );
  };

  const onClickEdit = () => {
    if (edit) {
      setEdit(false);
      form.setValue("name", user.name);
      form.setValue("email", user?.email ?? "");
    } else {
      setEdit(true);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === " " || e.keyCode === 32) {
      e.preventDefault();
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex gap-5">
        <p className="text-3xl">Perfil</p>
        <p
          onClick={() => onClickEdit()}
          className="my-auto cursor-pointer text-sm italic text-blue"
        >
          {edit ? "Cancelar" : "Editar"}
        </p>
      </div>
      <div className="mt-10 flex gap-10 relative">
        <button className="absolute bottom-0 right-10"></button>
        <div className="flex w-[40%] flex-col gap-y-5 rounded-normal p-1">
          <form
            {...form}
            onSubmit={form.handleSubmit((data) => onSettingsSubmit(data))}
            className={`flex flex-col gap-y-5`}
          >
            <div className="flex flex-col gap-y-4">
              <label>Nombre de usuario</label>
              <input
                {...form.register("name")}
                type="text"
                disabled={!edit}
                onKeyDown={handleKeyPress}
                className="h-9 rounded-small bg-platinum px-3"
              />
            </div>
            <div className="flex flex-col gap-y-4">
              <label>Email</label>
              <input
                {...form.register("email")}
                type="email"
                disabled={!edit}
                onKeyDown={handleKeyPress}
                className="h-9 rounded-small bg-platinum px-3"
              />
            </div>
            <div className="relative flex flex-col gap-y-4">
              <label>Contraseña</label>

              <input
                type="password"
                onKeyDown={handleKeyPress}
                disabled
                placeholder="************"
                className="h-9 rounded-small bg-platinum px-3"
              />
              <p
                onClick={() =>
                  setIsChangePasswordVisible(!isChangePasswordVisible)
                }
                className={`mt absolute -bottom-7 right-0 cursor-pointer text-sm italic ${
                  !edit
                    ? "pointer-events-none text-platinum"
                    : "pointer-events-auto text-blue"
                }`}
              >
                {!isChangePasswordVisible ? "Cambiar contraseña" : "Cerrar"}
              </p>
            </div>
            {isChangePasswordVisible && edit ? (
              <div className="flex flex-col gap-y-4">
                <label>Nueva contraseña</label>
                <div className="relative w-full">
                  <div
                    onClick={() => {
                      setPasswordInputType((prev) => {
                        if (prev === "password") return "text";
                        return "password";
                      });
                    }}
                    className="absolute bottom-2 right-2 cursor-pointer"
                  >
                    <MdIcon
                      path={mdiEye}
                      color={
                        passwordInputType === "password" ? "black" : "blue"
                      }
                      size={1}
                    />
                  </div>
                  <input
                    {...form.register("password")}
                    type={passwordInputType}
                    onKeyDown={handleKeyPress}
                    className="passw h-9 w-full rounded-small bg-platinum px-3"
                  />
                </div>
              </div>
            ) : null}

            <button
              disabled={!edit}
              type="submit"
              className="primary-btn mt-10 w-[50%] disabled:bg-grey disabled:text-black"
            >
              Guardar cambios
            </button>
          </form>
        </div>
        <div className="mb-auto flex w-[60%] justify-center">
          <input
            ref={pictureRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileUploadchange(e)}
          />
          <div
            onClick={() => pictureRef.current.click()}
            style={{ backgroundImage: `url('${url}')`, pointerEvents: !edit ? 'none' : 'auto' }}
            className="relative grid h-[300px] w-[300px] cursor-pointer place-content-center rounded-[50%] border-[1px] border-dashed border-black bg-contain bg-center bg-no-repeat hover:border-blue"
          >
            <MdIcon path={mdiPlus} color="black" size={2} />
          </div>
        </div>
      </div>
      <style jsx>
        {`
          input {
            color: ${!edit ? "black" : "blue"};
          }
        `}
      </style>
    </>
  );
};

export default ProfileSettings;
