import React from 'react';
import { AddUserRuleComponent } from './AddUserRuleComponent';
import { UserAdminList } from './UserAdminList';
function UserAdminPage() {
    return (
        <div className="container mx-auto p-4 w-full">
            <AddUserRuleComponent title="Agregar Permisos" />
            <UserAdminList />
        </div>
    );
}

export default UserAdminPage;
