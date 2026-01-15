// frontend/src/pages/lavadores/ComisionesDiarias.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, DatePicker, Spin, message, InputNumber, Select } from "antd";
import moment from "moment";
import reportesApi from "../../api/reportesApi";

const { Option } = Select;

const ComisionesDiarias = () => {
  const [fecha, setFecha] = useState(moment());
  const [comisiones, setComisiones] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalOrden, setModalOrden] = useState(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [pagoRecibido, setPagoRecibido] = useState(0);

  const puntoId = "64f0c7e0f0e5a9d1c0b0a1a2"; // Ajusta según tu BD

  // Cargar comisiones del día seleccionado
  const cargarComisiones = async () => {
    try {
      setLoading(true);
      const { data } = await reportesApi.obtenerComisionesDiarias({
        fecha: fecha.format("YYYY-MM-DD"),
        punto_id: puntoId
      });

      if (data.success) {
        // Convertir objeto resumen a array para tabla
        const array = Object.values(data.resumen).map(r => ({
          lavador_id: r.lavador._id,
          lavador_nombre: r.lavador_nombre || r.lavador.toString(),
          total: r.total
        }));
        setComisiones(array);
      }
    } catch (err) {
      console.error("Error cargando comisiones:", err);
      message.error("No se pudieron cargar las comisiones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarComisiones();
  }, [fecha]);

  // Abrir modal de cobro
  const abrirModalCobrar = async (lavador_id) => {
    try {
      setLoading(true);
      const { data } = await reportesApi.obtenerHistorialLavador(lavador_id, puntoId);
      if (data.success) {
        // Tomamos la primera orden pendiente como ejemplo para cobrar
        const orden = data.ordenes.find(o => !o.fecha_cobro);
        if (!orden) {
          message.warning("No hay órdenes pendientes para este lavador");
          return;
        }

        // Calcular comisión temporal
        const porcentaje = 40;
        const monto = Math.round(orden.total * porcentaje / 100);

        setModalOrden({ ...orden, comision_lavador: { monto, porcentaje } });
        setPagoRecibido(orden.total);
        setMetodoPago("efectivo");
        setModalVisible(true);
      }
    } catch (err) {
      console.error(err);
      message.error("Error cargando orden del lavador");
    } finally {
      setLoading(false);
    }
  };

  // Confirmar cobro
  const confirmarCobro = async () => {
    try {
      if (!modalOrden) return;
      setLoading(true);

      const { data } = await reportesApi.cobrarOrden(modalOrden._id, {
        lavador_asignado: modalOrden.lavador_asignado._id,
        metodo_pago: metodoPago,
        pago_recibido: pagoRecibido
      });

      if (data.success) {
        message.success("Orden cobrada correctamente");
        setModalVisible(false);
        cargarComisiones(); // refrescar tabla
      }
    } catch (err) {
      console.error(err);
      message.error("Error cobrando la orden");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Lavador", dataIndex: "lavador_nombre", key: "lavador_nombre" },
    { title: "Total comisión", dataIndex: "total", key: "total", render: (v) => `$${v}` },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Button onClick={() => abrirModalCobrar(record.lavador_id)}>Ver / Cobrar</Button>
      )
    }
  ];

  return (
    <div>
      <h2>Comisiones diarias</h2>
      <DatePicker value={fecha} onChange={setFecha} style={{ marginBottom: 16 }} />
      {loading ? <Spin /> : <Table dataSource={comisiones} columns={columns} rowKey="lavador_id" />}

      <Modal
        visible={modalVisible}
        title={`Cobrar orden: ${modalOrden?.numero_orden || ""}`}
        onCancel={() => setModalVisible(false)}
        onOk={confirmarCobro}
        okText="Cobrar"
      >
        {modalOrden && (
          <>
            <p>
              <strong>Cliente:</strong> {modalOrden.cliente_id || "Sin cliente"}
            </p>
            <p>
              <strong>Total:</strong> ${modalOrden.total}
            </p>
            <p>
              <strong>Comisión lavador:</strong> ${modalOrden.comision_lavador.monto} ({modalOrden.comision_lavador.porcentaje}%)
            </p>

            <p>
              <strong>Método de pago:</strong>
              <Select value={metodoPago} onChange={setMetodoPago} style={{ width: "100%" }}>
                <Option value="efectivo">Efectivo</Option>
                <Option value="tarjeta">Tarjeta</Option>
                <Option value="transferencia">Transferencia</Option>
              </Select>
            </p>

            <p>
              <strong>Pago recibido:</strong>
              <InputNumber
                value={pagoRecibido}
                onChange={setPagoRecibido}
                min={0}
                style={{ width: "100%" }}
              />
            </p>
            <p>
              <strong>Vuelto:</strong> ${Math.max(pagoRecibido - modalOrden.total, 0)}
            </p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ComisionesDiarias;
