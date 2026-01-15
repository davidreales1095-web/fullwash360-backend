import React from 'react';
import { Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Option } = Select;

const SelectLavador = ({ lavadores, value, onChange, error, loading = false }) => {
  return (
    <div>
      <Select
        value={value}
        onChange={onChange}
        placeholder="Selecciona un lavador"
        loading={loading}
        showSearch
        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
        style={{ width: '100%' }}
        status={error ? 'error' : ''}
        allowClear
      >
        {lavadores.length > 0 ? (
          lavadores.map(lavador => (
            <Option key={lavador._id} value={lavador._id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserOutlined />
                <div><strong>{lavador.codigo}</strong> - {lavador.nombre}</div>
              </div>
            </Option>
          ))
        ) : (
          <Option disabled value="">No hay lavadores disponibles</Option>
        )}
      </Select>
      {error && (<div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>⚠️ Debes seleccionar un lavador para cobrar la orden</div>)}
    </div>
  );
};

export default SelectLavador;
