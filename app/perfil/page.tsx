import BotonDescargarPDF from "../components/BotonDescargarPDF";

export default function PaginaPerfil() {
  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <h1 className="text-2xl font-bold">Mi perfil</h1>
      <BotonDescargarPDF />
    </div>
  );
}
