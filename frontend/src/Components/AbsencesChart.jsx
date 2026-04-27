import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AbsencesChart() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/absences/")
      .then((res) => {
        const absences = res.data;

        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const counts = {};

        absences.forEach((a) => {
          const date = new Date(a.date);
          const month = months[date.getMonth()];
          counts[month] = (counts[month] || 0) + 1;
        });

        const chartData = months.map((m) => ({
          mois: m,
          total: counts[m] || 0
        }));

        setData(chartData);
      });
  }, []);

  // CLICK HANDLER
  const handleClick = (data) => {
    if (!data || !data.activeLabel) return;

    const mois = data.activeLabel;

    // navigation vers page filtrée
    navigate(`/admin/absences?mois=${mois}`);
  };

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3>Absences par mois</h3>

      <ResponsiveContainer>
        <BarChart data={data} onClick={handleClick}>
          <XAxis dataKey="mois" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" cursor="pointer" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
