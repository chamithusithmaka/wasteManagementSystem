import React from 'react'

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 flex items-center border-l-4 ${color}`}
    >
      <div
        className={`rounded-full p-3 mr-4 ${color
          .replace('border', 'bg')
          .replace('-500', '-100')} ${color.replace('border', 'text')}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  )
}

export default StatCard
