import React, { useState } from "react";
import { Table, Input, Button, Spin, message } from "antd";
import reportesApi from "../../api/reportesApi";
import dayjs from "dayjs";

const HistorialPorPlaca = ({ punto_id }) => {
  const [placa, setPlaca] = useState("");
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscarHistorial = async () => {
    if (!placa.trim()) return message.warning("Ingrese la placa");
    try {
      setLoading(true);
      const res = await reportesApi.obtenerHistorialPorPlaca(placa.trim(), punto_id);
      if (res.data.success) {
        setOrdenes(res.data.ordenes);
      } else {
        message.error(res.data.msg || "Error al cargar historial");
      }
    } catch (err) {
      console.error("Error cargando historial:", err);
      message.error("Error cargando historial");
    } finally {
      setLoading(false);
    }
  };

  const columnas = [
    { title: "Número Orden", dataIndex: "numero_orden", key: "numero_orden" },
    { title: "Placa", dataIndex: "placa", key: "placa" },
    { title: "Lavador", dataIndex: ["lavador_asignado"], key: "lavador_asignado" },
    { title: "Total", dataIndex: "total", key: "total" },
    { 
      title: "Fecha Cobro", 
      dataIndex: "fecha_cobro", 
      key: "fecha_cobro", 
      render: f => f ? dayjs(f).format("YYYY-MM-DD HH:mm") : "-" 
    }
  ];

  return (
    <div>
      <h2>Historial por Placa</h2>
      <Input.Search
        placeholder="Ingrese placa"
        enterButton="Buscar"
        value={placa}
        onChange={e => setPlaca(e.target.value)}
        onSearch={buscarHistorial}
        style={{ marginBottom: 16, width: 300 }}
      />
      <Spin spinning={loading}>
        <Table
          dataSource={ordenes}
          columns={columnas}
          rowKey="_id"
        />
      </Spin>
    </div>
  );
};

export default HistorialPorPlaca;
