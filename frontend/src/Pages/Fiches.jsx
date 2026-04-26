import { useEffect, useState } from "react";
import API from "../Services/api";

export default function Fiches() {
  const [fiches, setFiches] = useState([]);

  useEffect(() => {
    API.get("/api/paie/")
      .then((res) => setFiches(res.data))
      .catch((err) => console.error(err));
  }, []);

  const downloadPDF = async (id) => {
    const token = localStorage.getItem("access");

    const res = await fetch(
      `http://127.0.0.1:8000/api/paie/${id}/pdf/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `fiche_${id}.pdf`;
    a.click();
  };

  return (
    <div>
      <h1>Fiches de paie</h1>

      {fiches.map((fiche) => (
        <div key={fiche.id} className="fiche-card">

          <p>{fiche.salarie_nom}</p>
          <p>{fiche.mois}</p>
          <p>{fiche.salaire} €</p>

          {/* 🔥 BOUTON PDF */}
          <button onClick={() => downloadPDF(fiche.id)}>
            📄 Télécharger PDF
          </button>

        </div>
      ))}

    </div>
  );
}
