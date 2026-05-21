package pt.siaguh.app.data.model

// --- Auth ---

data class LoginRequest(val username: String, val password: String)

data class Hospital(val idhosp: Int, val nome: String, val localizacao: String?)

data class LoginResponse(
    val message: String,
    val username: String,
    val nome: String,
    val role: String,
    val idfunc: Int,
    val hospitais: List<Hospital> = emptyList()
)

// --- Utente ---

data class Utente(
    val numutent: Int,
    val nome: String,
    val nif: String,
    val datanasc: String,
    val sexo: String,
    val localidade: String?
)

data class Antecedente(
    val codantecedente: Int?,
    val descricao: String?,
    val tipo: String?,
    val numutent: Int?
)

// --- Episódio ---

data class Episodio(
    val codepurgenc: Int,
    val numutent: Int,
    val idhosp: Int,
    val estado: String,
    val datahoraentr: String,
    val datahorasaida: String?
)

// --- Triagem / Pulseira ---

data class Triagem(
    val codepurgenc: Int,
    val cortriagem: String,
    val sintomas: String?,
    val temperatura: Double?,
    val freqcard: Int?,
    val freqresp: Int?,
    val spo2: Double?,
    val sistolica: Int?,
    val diastolica: Int?,
    val datahorainicio: String?,
    val datahorafim: String?
)
