import React, { useEffect, useState } from "react";
import axios from "axios";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para Filtro e Paginação
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

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

  // 1. Filtragem por nome
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 2. Ordenação Alfabética (padrão)
  const sortedUsers = [...filteredUsers].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // 3. Lógica de Paginação
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  // Resetar para a página 1 quando pesquisar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading)
    return <p className="py-10 text-center">Carregando utilizadores...</p>;

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de Pesquisa */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gray-100 p-4 shadow-sm">
        <div className="flex flex-grow flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">
            Pesquisar Utilizador
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nome ou email..."
            className="focus:ring-secondary-400 w-full max-w-md rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
          />
        </div>
        <div className="text-sm text-gray-500">
          Total: <strong>{filteredUsers.length}</strong> utilizadores
        </div>
      </div>

      {/* Tabela */}
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
                Papel Atual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                Alterar Papel
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user._id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
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
                      {["user", "admin", "support", "superadmin"].map(
                        (role) => (
                          <label
                            key={role}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs transition hover:bg-gray-200"
                          >
                            <input
                              type="radio"
                              name={`role-${user._id}`}
                              value={role}
                              checked={user.role === role}
                              onChange={() => updateRole(user._id, role)}
                              className="text-primary-600 h-3 w-3"
                            />
                            <span className="capitalize">
                              {role === "user"
                                ? "Utilizador"
                                : role === "support"
                                  ? "Suporte"
                                  : role}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Nenhum utilizador encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-30"
          >
            Anterior
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`rounded-lg px-4 py-2 text-sm ${
                currentPage === i + 1
                  ? "bg-primary-500 text-white"
                  : "border hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-30"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManager;
