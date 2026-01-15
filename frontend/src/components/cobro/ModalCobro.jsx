import React, { useState, useEffect } from 'react';
import { Modal, Card, Typography, Divider, Row, Col, Tag, Button, Alert, Spin } from 'antd';
import { DollarOutlined, UserOutlined, CarOutlined, CalendarOutlined, LoadingOutlined } from '@ant-design/icons';
import SelectLavador from './SelectLavador';
import { formatCurrency } from '../../utils/formatCurrency';

const { Title, Text } = Typography;

const ModalCobro = ({ visible, orden, lavadores = [], onConfirm, onCancel, loading = false }) => {
  const [lavadorSeleccionado, setLavadorSeleccionado] = useState(null);
  const [errorLavador, setErrorLavador] = useState(false);

  useEffect(() => {
    if (visible) { setLavadorSeleccionado(null); setErrorLavador(false); }
  }, [visible]);

  const handleConfirmar = () => {
    if (!lavadorSeleccionado) { setErrorLavador(true); return; }
    onConfirm(lavadorSeleccionado);
  };

  const handleCancelar = () => { setLavadorSeleccionado(null); setErrorLavador(false); onCancel(); };

  const totalOrden = orden?.total || 0;
  const comisionPorcentaje = 40;
  const comisionLavador = totalOrden * (comisionPorcentaje / 100);
  const gananciaLocal = totalOrden - comisionLavador;

  const getLabelTipoVehiculo = (tipo) => ({ carro: '🚗 Carro', moto: '🏍️ Moto', taxi: '🚕 Taxi', camioneta: '🚙 Camioneta' }[tipo] || tipo);
  const getLabelTipoLavado = (tipo) => ({ express: '⚡ Express', elite: '✨ Elite', premium: '👑 Premium' }[tipo] || tipo);

  if (!orden) return null;

  return (
    <Modal
      title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><DollarOutlined style={{ color: '#52c41a' }} /><span>Cobrar Orden</span><Tag color="blue" style={{ marginLeft: 'auto' }}>{orden.numero_orden}</Tag></div>}
      open={visible}
      onCancel={handleCancelar}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancelar} disabled={loading}>Cancelar</Button>,
        <Button key="submit" type="primary" onClick={handleConfirmar} loading={loading} disabled={!lavadorSeleccionado || loading}>
          {loading ? 'Cobrando...' : 'Confirmar Cobro'}
        </Button>
      ]}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} /><div style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Procesando cobro...</div></div>
      ) : (
        <>
          <Card size="small" title="📋 Información de la Orden" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text type="secondary">Vehículo:</Text>
                <div style={{ fontSize: 16, fontWeight: 'bold' }}><CarOutlined style={{ marginRight: 8 }} />{getLabelTipoVehiculo(orden.tipo_vehiculo)}</div>
                <Text strong>{orden.placa}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Servicio:</Text>
                <div style={{ fontSize: 16, fontWeight: 'bold' }}>{getLabelTipoLavado(orden.tipo_lavado)}</div>
                <Tag color={orden.es_decima_gratis ? 'green' : 'blue'}>
                  {orden.es_decima_gratis ? '🎉 10ma GRATIS' : `Lavada #${orden.contador_lavada || 1}/10`}
                </Tag>
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0, color: orden.es_decima_gratis ? '#52c41a' : '#1890ff' }}>
                {orden.es_decima_gratis ? '💰 GRATIS' : formatCurrency(totalOrden)}
              </Title>
              {orden.es_decima_gratis && (<Text type="secondary" style={{ fontSize: 12 }}>(Valor original: {formatCurrency(totalOrden)})</Text>)}
            </div>
          </Card>

          <Card size="small" title="👷 Asignar Lavador" style={{ marginBottom: 16 }}>
            <Alert message="Lavador requerido" description="El lavador es necesario para calcular su comisión del 40%." type="info" showIcon style={{ marginBottom: 12 }} />
            <SelectLavador lavadores={lavadores} value={lavadorSeleccionado} onChange={(id) => { setLavadorSeleccionado(id); setErrorLavador(false); }} error={errorLavador} />
          </Card>

          <Card size="small" title="💰 Resumen de Comisiones" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
              <Col span={12}><Text strong>Total orden:</Text></Col>
              <Col span={12} style={{ textAlign: 'right' }}><Text strong>{formatCurrency(totalOrden)}</Text></Col>
            </Row>
            <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
              <Col span={12}><Text type="secondary">Comisión lavador:</Text></Col>
              <Col span={12} style={{ textAlign: 'right' }}><Text type="secondary" style={{ color: '#fa8c16' }}>{formatCurrency(comisionLavador)} ({comisionPorcentaje}%)</Text></Col>
            </Row>
            <Row gutter={[16, 8]}>
              <Col span={12}><Text strong>Ganancia local:</Text></Col>
              <Col span={12} style={{ textAlign: 'right' }}><Text strong style={{ color: '#52c41a' }}>{formatCurrency(gananciaLocal)}</Text></Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            {lavadorSeleccionado && (<Alert message="¡Listo para cobrar!" description={`El lavador recibirá ${formatCurrency(comisionLavador)} (${comisionPorcentaje}%)`} type="success" showIcon />)}
          </Card>

          <div style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 16 }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            La orden se marcará como cobrada y aparecerá en el historial.
          </div>
        </>
      )}
    </Modal>
  );
};

export default ModalCobro;
