import React, { useEffect, useState } from "react";
import axios from "axios";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/users/all");
        setUsers(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar utilizadores");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const updateRole = async (userId, newRole) => {
    try {
      const { data } = await axios.put(`/users/${userId}/role`, {
        role: newRole,
      });
      setUsers(users.map((u) => (u._id === userId ? data : u)));
      alert(`Papel alterado para ${newRole}`);
    } catch (error) {
      alert("Erro ao alterar papel");
    }
  };

  if (loading) return <p className="text-center">Carregando utilizadores...</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Nome
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Papel atual
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Alterar papel
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                {user.name}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                    user.role === "superadmin"
                      ? "bg-purple-100 text-purple-800"
                      : user.role === "admin"
                        ? "bg-blue-100 text-blue-800"
                        : user.role === "support"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.role === "superadmin"
                    ? "Superadmin"
                    : user.role === "admin"
                      ? "Admin"
                      : user.role === "support"
                        ? "Suporte"
                        : "Utilizador"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                <div className="flex flex-wrap gap-2">
                  {["user", "admin", "support", "superadmin"].map((role) => (
                    <label
                      key={role}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs transition hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name={`role-${user._id}`}
                        value={role}
                        checked={user.role === role}
                        onChange={() => updateRole(user._id, role)}
                        className="h-3 w-3"
                      />
                      <span>
                        {role === "superadmin"
                          ? "Superadmin"
                          : role === "admin"
                            ? "Admin"
                            : role === "support"
                              ? "Suporte"
                              : "Utilizador"}
                      </span>
                    </label>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManager;
