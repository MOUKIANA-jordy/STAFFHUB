import { useEffect, useState } from "react";
import API from "../../../Services/api";
import "../../../Styles/form.css";

export default function Fiches() {
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // 📡 FETCH FICHES
  // ===============================
  useEffect(() => {
    API.get("/api/paie/")
      .then((res) => {
        setFiches(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // ===============================
  // 👁️ PREVIEW PDF
  // ===============================
  const previewPDF = (id) => {
    const token = localStorage.getItem("access");

    window.open(
      `http://127.0.0.1:8000/api/paie/${id}/pdf/?token=${token}`,
      "_blank"
    );
  };

  // ===============================
  // 📄 DOWNLOAD PDF
  // ===============================
  const downloadPDF = async (id) => {
    try {
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
    } catch (err) {
      console.error("Erreur téléchargement:", err);
    }
  };

  // ===============================
  // UI
  // ===============================
  if (loading) return <p>Chargement...</p>;

  return (
    <div className="fiches-page">

      <h1>📄 Fiches de paie</h1>

      <div className="fiches-grid">

        {fiches.length === 0 ? (
          <p>Aucune fiche disponible</p>
        ) : (
          fiches.map((fiche) => (
            <div key={fiche.id} className="fiche-card">

              <h3>{fiche.salarie_nom || "Salarié"}</h3>
              <p>Mois : {fiche.mois}</p>
              <p>Salaire : {fiche.salaire} €</p>

              <div className="actions">

                {/* 👁️ PREVIEW */}
                <button onClick={() => previewPDF(fiche.id)}>
                  👁️ Voir
                </button>

                {/* 📄 DOWNLOAD */}
                <button onClick={() => downloadPDF(fiche.id)}>
                  📄 Télécharger
                </button>

              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
}
