export const LoadingSpinner = (props: { color: string }) => {
  return (
    <div
      className={`rounded-[50%] ${props.color} border-[2px] border-t-transparent p-3 animate-spin`}
    />
  );
};

export const LoadingPage = () => {
  return (
    <div className="absolute bottom-0 top-0 grid h-screen w-screen place-content-center">
      <LoadingSpinner color="border-pink" />
    </div>
  );
};
