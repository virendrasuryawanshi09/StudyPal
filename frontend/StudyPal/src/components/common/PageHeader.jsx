import React from 'react'

const PageHeader = ({title, subtitle, children}) => {
  return (
    <div className="flex items-center justify-between nb-6">
      <div>
        <h1 className="text-2xl font-medium text-slate-900 tracking-light mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 text-sm">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  )
}

export default PageHeader