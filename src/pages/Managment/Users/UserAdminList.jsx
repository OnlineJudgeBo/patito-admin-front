import React, { useEffect, useState } from "react";
import { apiService } from "../../../services/apiService";
import { DisableAdminUserComponent } from "./DisableAdminUserComponent";

export function UserAdminList() {
  const [userList, setUserList] = useState([]);
  useEffect(() => {
    apiService.fetchRoles()
      .then(data => {
        let userList = data.flatMap(user =>
          user.userRoles.map(role => {
            return {
              userId: user.userId,
              roleId: role.role.roleId,
              roleName: role.role.roleName,
              userProfile: user.userProfile
            };
          })
        );
        setUserList(userList);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);
  return (
    <table className="table-auto w-full border-collapse">
      <thead className="bg-gray-700 text-white">
        <tr className="border-b transition-colors hover:bg-muted/50">
          <th className="p-3 px-8 font-semibold dt-orderable-asc dt-orderable-desc border-r border-gray-200">Usuario</th>
          <th className="p-3 px-8 font-semibold dt-orderable-asc dt-orderable-desc border-r border-gray-200">Nombre</th>
          <th className="p-3 px-8 font-semibold dt-orderable-asc dt-orderable-desc border-r border-gray-200">Apellido</th>
          <th className="p-3 px-8 font-semibold dt-orderable-asc dt-orderable-desc border-r border-gray-200">Permiso</th>
          <th className="p-3 px-8 font-semibold dt-orderable-asc dt-orderable-desc">Desactivar</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {userList.map((user, index) => (
          <tr key={index}>
            <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{user.userId}</td>
            <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{user.userProfile.nick}</td>
            <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{user.userProfile.lastname}</td>
            <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{user.roleName}</td>
            <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
              <DisableAdminUserComponent userId={user.userId} roleId={user.roleId} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
