interface IShimmer {
  width: string;
  height: string;
}

export default function LoadingCard(props: IShimmer) {
  return (
    <div className="">
      <div className={`skeleton ${props.width} ${props.height} overflow-hidden `} />
      <style jsx>
        {`
          .skeleton::before {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
            background-image: linear-gradient(
              90deg,
              rgba(#fff, 0) 0,
              rgba(#fff, 0.2) 20%,
              rgba(#fff, 0.5) 60%,
              rgba(#fff, 0)
            );
            animation: shimmer 2s infinite;
            content: "";
          }

          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
    </div>
  );
}
