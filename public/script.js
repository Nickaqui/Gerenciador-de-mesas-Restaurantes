document.addEventListener("DOMContentLoaded", () => {
  const reservaForm = document.getElementById("reserva-form");
  const disponibilidadeForm = document.getElementById("disponibilidade-form");
  const reservasList = document.getElementById("reservas-list");
  const searchButton = document.getElementById("search-button");
  const disponibilidadeResult = document.getElementById("disponibilidade-result");

  const API_URL = "http://localhost:3000/api";

  const fetchReservas = async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${API_URL}/reservas?${queryString}` : `${API_URL}/reservas`;
      const response = await fetch(url);
      const reservas = await response.json();
      renderReservas(reservas);
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      alert("Não foi possível carregar as reservas.");
    }
  };

  const renderReservas = (reservas) => {
    reservasList.innerHTML = "";
    reservas.forEach((reserva) => {
      const li = document.createElement("li");
      const statusClass = reserva.status === 'disponivel' ? 'status-disponivel' : 
                         reserva.status === 'ocupado' ? 'status-ocupado' : 'status-reservado';
      
      li.innerHTML = `
        <div class="reserva-info">
          <strong>${reserva.nomeCliente}</strong><br>
          <small><i class="fas fa-chair"></i> Mesa ${reserva.numeroMesa}</small> - 
          <small><i class="fas fa-calendar-alt"></i> ${new Date(reserva.dataHoraReserva).toLocaleString()}</small><br>
          <small><i class="fas fa-phone"></i> Contato: ${reserva.contatoCliente}</small>
          <span class="status ${statusClass}">${reserva.status}</span>
        </div>
        <div class="reserva-actions">
          <button class="edit-btn" data-id="${reserva._id}"><i class="fas fa-edit"></i> Editar</button>
          <button class="delete-btn" data-id="${reserva._id}"><i class="fas fa-trash"></i> Excluir</button>
        </div>
      `;
      reservasList.appendChild(li);
    });
  };

  reservaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("reserva-id").value;
    const reservaData = {
      nomeCliente: document.getElementById("nomeCliente").value,
      numeroMesa: parseInt(document.getElementById("numeroMesa").value),
      dataHoraReserva: document.getElementById("dataHoraReserva").value,
      contatoCliente: document.getElementById("contatoCliente").value,
      status: document.getElementById("status").value,
    };

    try {
      const url = id ? `${API_URL}/reservas/${id}` : `${API_URL}/reservas`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservaData),
      });
      
      const result = await response.json();
      alert(result.message);
      reservaForm.reset();
      document.getElementById("reserva-id").value = "";
      fetchReservas();
    } catch (error) {
      console.error("Erro ao salvar reserva:", error);
      alert("Erro ao salvar reserva.");
    }
  });

  disponibilidadeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dataHora = document.getElementById("check-dataHora").value;
    const numeroMesa = document.getElementById("check-mesa").value;

    try {
      const url = `${API_URL}/disponibilidade?dataHora=${dataHora}&numeroMesa=${numeroMesa}`;
      const response = await fetch(url);
      const result = await response.json();
      
      disponibilidadeResult.innerHTML = `
        <div class="disponibilidade-info ${result.disponivel ? 'disponivel' : 'indisponivel'}">
          <h3>Mesa ${result.numeroMesa} - ${new Date(result.dataHora).toLocaleString()}</h3>
          <p><strong>Status:</strong> ${result.disponivel ? 'DISPONÍVEL' : 'INDISPONÍVEL'}</p>
          ${!result.disponivel && result.reservasConflitantes.length > 0 ? 
            `<p><strong>Conflitos:</strong> ${result.reservasConflitantes.length} reserva(s) encontrada(s)</p>` : ''}
        </div>
      `;
    } catch (error) {
      console.error("Erro ao verificar disponibilidade:", error);
      alert("Erro ao verificar disponibilidade.");
    }
  });

  reservasList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.dataset.id;
      if (confirm("Tem certeza que deseja excluir esta reserva?")) {
        try {
          const response = await fetch(`${API_URL}/reservas/${id}`, { method: "DELETE" });
          const result = await response.json();
          alert(result.message);
          fetchReservas();
        } catch (error) {
          console.error("Erro ao excluir reserva:", error);
          alert("Erro ao excluir reserva.");
        }
      }
    }

    if (e.target.classList.contains("edit-btn")) {
      const id = e.target.dataset.id;
      try {
        const response = await fetch(`${API_URL}/reservas/${id}`);
        const reserva = await response.json();

        document.getElementById("reserva-id").value = reserva._id;
        document.getElementById("nomeCliente").value = reserva.nomeCliente;
        document.getElementById("numeroMesa").value = reserva.numeroMesa;
        document.getElementById("dataHoraReserva").value = new Date(reserva.dataHoraReserva).toISOString().slice(0, 16);
        document.getElementById("contatoCliente").value = reserva.contatoCliente;
        document.getElementById("status").value = reserva.status;
      } catch (error) {
        console.error("Erro ao carregar reserva:", error);
        alert("Erro ao carregar reserva para edição.");
      }
    }
  });
  
  searchButton.addEventListener("click", () => {
    const params = {};
    const nomeCliente = document.getElementById("search-nome").value;
    const numeroMesa = document.getElementById("search-mesa").value;
    const status = document.getElementById("search-status").value;

    if (nomeCliente) params.nomeCliente = nomeCliente;
    if (numeroMesa) params.numeroMesa = numeroMesa;
    if (status) params.status = status;

    fetchReservas(params);
  });

  // Carregar reservas iniciais
  fetchReservas();
});

