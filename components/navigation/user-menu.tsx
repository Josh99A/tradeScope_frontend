import React from 'react'

const UserMenu = ({ user }: { user: any }) => {
  return (
    <button className="flex items-center gap-2 rounded-full border border-ts-border bg-ts-bg-main p-1">
      <img
        src={user?.photo_url || "/avatar-placeholder.png"}
        alt="User avatar"
        className="h-8 w-8 rounded-full object-cover"
      />
    </button>
  )
}

export default UserMenu
