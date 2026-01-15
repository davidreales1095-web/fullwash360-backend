import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin, message } from "antd";
import reportesApi from "../../api/reportesApi";

const Estadisticas = ({ punto_id }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  const cargarStats = async () => {
    try {
      setLoading(true);
      const res = await reportesApi.obtenerStats(punto_id);
      if (res.data.success) {
        setStats(res.data);
      } else {
        message.error(res.data.msg || "Error al cargar estadísticas");
      }
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
      message.error("Error cargando estadísticas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarStats();
  }, []);

  return (
    <Spin spinning={loading}>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Total Ordenes">{stats.totalOrdenes || 0}</Card>
        </Col>
        <Col span={8}>
          <Card title="Total Clientes">{stats.totalClientes || 0}</Card>
        </Col>
        <Col span={8}>
          <Card title="Total Lavadores">{stats.totalLavadores || 0}</Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default Estadisticas;
