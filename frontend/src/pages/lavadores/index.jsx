import React, { useState } from 'react';
import { Tabs, Card, Typography, Alert, Space, Tag } from 'antd';
import { 
  TeamOutlined, 
  DollarOutlined, 
  InfoCircleOutlined,
  CarOutlined,
  UserOutlined 
} from '@ant-design/icons';
import ListaLavadores from './ListaLavadores';
import ComisionesDiarias from './ComisionesDiarias';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const LavadoresPage = () => {
  const [activeTab, setActiveTab] = useState('lavadores');

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Gestión de Lavadores
        </Title>
        <Text type="secondary">
          Administra lavadores y consulta sus comisiones diarias
        </Text>
      </div>

      {/* Alertas informativas */}
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Alert
          message="💰 Sistema de Comisiones"
          description={
            <div>
              Cada lavador recibe el <Tag color="green">40%</Tag> del valor de cada lavado.
              <div style={{ marginTop: 4, fontSize: '12px' }}>
                <CarOutlined /> Se muestra placa, tipo de vehículo y tipo de lavado
              </div>
            </div>
          }
          type="info"
          showIcon
          icon={<DollarOutlined />}
        />
        
        <Alert
          message="📊 Datos en Tiempo Real"
          description="Las comisiones se calculan automáticamente basado en las órdenes del día."
          type="success"
          showIcon
          icon={<InfoCircleOutlined />}
        />
      </Space>

      {/* Pestañas principales */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
        >
          <TabPane
            tab={
              <span>
                <TeamOutlined />
                Lavadores
              </span>
            }
            key="lavadores"
          >
            <ListaLavadores />
          </TabPane>
          <TabPane
            tab={
              <span>
                <DollarOutlined />
                Comisiones Diarias
              </span>
            }
            key="comisiones"
          >
            <ComisionesDiarias />
          </TabPane>
        </Tabs>
      </Card>

      {/* Pie de página informativo */}
      <Card size="small" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              <UserOutlined /> Sistema Integral
            </Title>
            <Text type="secondary">
              Lavadores + Comisiones + Seguimiento por vehículo
            </Text>
          </div>
          <Tag color="blue">v1.0</Tag>
        </div>
      </Card>
    </div>
  );
};

export default LavadoresPage;