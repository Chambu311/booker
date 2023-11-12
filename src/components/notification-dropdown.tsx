import { mdiBell, mdiClose } from "@mdi/js";
import MdIcon from "./ui/mdIcon";
import { useState } from "react";
import { api } from "~/utils/api";
import { Notification, User } from "@prisma/client";
import { useRouter } from "next/router";

const NotificationDropdown = (props: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const notificationsQuery = api.notification.getNotSeenByUserId.useQuery({
    userId: props.user?.id,
  });
  const deleteNotificationsMutation =
    api.notification.deleteAllByUserId.useMutation();
  const notifications = notificationsQuery.data;
  const areThereNotifications = notifications && notifications.length > 0;
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const onClickNotification = async () => {
    await router.push(`/profile/${props.user?.name}?view=swaps`);
  };

  return (
    <div className="relative">
      <div className="absolute right-0 grid h-5 w-5 place-content-center rounded-[50%] bg-black text-xs text-white">
        {notifications?.length ?? 0}
      </div>
      <div className="mt-2 cursor-pointer" onClick={() => toggleDropdown()}>
        <MdIcon path={mdiBell} color="white" size={1.5} />
      </div>
      {isOpen && (
        <div
          className="absolute right-0 mt-3 origin-top overflow-visible bg-transparent"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="wrapper relative h-full max-h-[500px] min-h-[100px] min-w-[400px] overflow-y-auto rounded-normal rounded-tr-none border-2 border-platinum bg-white p-4 shadow-lg">
            {areThereNotifications ? (
              notifications.map((notif, index) => (
                <NotificationPreview
                  key={index}
                  onClick={onClickNotification}
                  notification={notif}
                />
              ))
            ) : (
              <p className="p-5 text-black">No tienes notificaciones nuevas</p>
            )}
            <button
              onClick={() =>
                deleteNotificationsMutation.mutate(
                  { id: props.user?.id },
                  {
                    onSuccess: async () => {
                      await notificationsQuery.refetch();
                    },
                  },
                )
              }
              className="absolute right-1 top-2 text-sm text-carisma-700"
            >
              Eliminar todas
            </button>
          </div>
          <div className="triangle absolute -top-3 right-2 h-4 w-4 bg-white"></div>
        </div>
      )}
      <style jsx>
        {`
          .triangle {
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          }

          .wrapper {
            scrollbar-gutter: stable;
          }

          .wrapper::-webkit-scrollbar-track {
            background: transparent;
          }

          .wrapper::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 40px;
          }
        `}
      </style>
    </div>
  );
};

export default NotificationDropdown;

const NotificationPreview = (props: {
  notification: Notification;
  onClick: (id: string) => void;
}) => {
  const { notification } = props;
  const fromUser = notification.content.split("-").at(0);
  const message = notification.content.split("-").at(1);
  return (
    <div
      onClick={() => props.onClick(notification.id)}
      className="relative flex w-full cursor-pointer gap-3 border-b-[1px] border-platinum p-3 hover:border-carisma-500"
    >
      <div className="h-10 w-10 rounded-[50%] bg-carisma-400"></div>
      <div className="flex flex-col">
        <p className="text-blue">@{fromUser}</p>
        <p className="text-balance text-sm text-black">{message}</p>
      </div>
    </div>
  );
};
