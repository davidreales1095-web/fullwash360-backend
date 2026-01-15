// frontend/src/pages/reportes/ReportesDiarios.jsx
import React, { useEffect, useState } from "react";
import { Table, DatePicker, Spin, message } from "antd";
import moment from "moment";
import reportesApi from "../../api/reportesApi";

const ReportesDiarios = () => {
  const [fecha, setFecha] = useState(moment());
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);

  const puntoId = "64f0c7e0f0e5a9d1c0b0a1a2"; // Ajusta según tu BD

  const cargarReportes = async () => {
    try {
      setLoading(true);
      const { data } = await reportesApi.obtenerHistorialPorFecha(fecha.format("YYYY-MM-DD"), puntoId);
      if (data.success) setOrdenes(data.ordenes);
    } catch (err) {
      console.error(err);
      message.error("Error cargando reportes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, [fecha]);

  const columns = [
    { title: "Número Orden", dataIndex: "numero_orden", key: "numero_orden" },
    { title: "Placa", dataIndex: "placa", key: "placa" },
    { title: "Total", dataIndex: "total", key: "total", render: (v) => `$${v}` },
    { title: "Lavador", dataIndex: ["lavador_asignado", "nombre"], key: "lavador" },
    { title: "Fecha Cobro", dataIndex: "fecha_cobro", key: "fecha_cobro", render: (v) => moment(v).format("YYYY-MM-DD HH:mm") }
  ];

  return (
    <div>
      <h2>Reportes diarios</h2>
      <DatePicker value={fecha} onChange={setFecha} style={{ marginBottom: 16 }} />
      {loading ? <Spin /> : <Table dataSource={ordenes} columns={columns} rowKey="_id" />}
    </div>
  );
};

export default ReportesDiarios;
