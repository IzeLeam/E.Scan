import ListItem from "../components/ListItem";

const EAN_CODES = [
  "3601029956230",
  "3601029807211",
  "3245670012345"
];

export default function List() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-6">
      <ul className="grid w-full gap-4">
        {EAN_CODES.map((ean) => (
          <ListItem key={ean} item={ean} />
        ))}
      </ul>
    </main>
  );
}
