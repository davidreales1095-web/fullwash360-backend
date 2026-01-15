// src/components/ordenes/BusquedaPlaca.jsx - VERSIÓN SIMPLIFICADA
import React, { useState } from 'react';
import { Input, Alert, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const BusquedaPlaca = ({ onPlacaSelect, value }) => {
  const [placa, setPlaca] = useState(value || '');

  const handlePlacaChange = (e) => {
    const nuevaPlaca = e.target.value.toUpperCase();
    setPlaca(nuevaPlaca);
    if (onPlacaSelect) {
      onPlacaSelect(nuevaPlaca);
    }
  };

  return (
    <div>
      <Input
        placeholder="Ingresa la placa del vehículo (ej: ABC123)"
        prefix={<SearchOutlined />}
        value={placa}
        onChange={handlePlacaChange}
        size="large"
        style={{ 
          width: '100%',
          fontSize: '16px',
          letterSpacing: '1px'
        }}
        autoFocus
      />
      
      {placa.length >= 3 && (
        <Alert
          message={`Buscando vehículo: ${placa}`}
          description="El sistema buscará automáticamente el historial"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default BusquedaPlaca;