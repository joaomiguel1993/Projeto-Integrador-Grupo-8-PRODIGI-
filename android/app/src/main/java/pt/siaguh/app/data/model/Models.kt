package pt.siaguh.app.data.model

import com.google.gson.annotations.SerializedName

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
    @SerializedName("num_utent", alternate = ["numutent"])
    val numutent: Int,
    val nome: String,
    val nif: String,
    @SerializedName("data_nasc", alternate = ["datanasc"])
    val datanasc: String?,
    val sexo: String,
    val localidade: String?,
    val telefone: String?,
    val email: String?
)

data class Antecedente(
    @SerializedName("cod_antecedente", alternate = ["codantecedente", "CodAntecedente"])
    val codantecedente: Int?,
    @SerializedName("descricao", alternate = ["Descricao"])
    val descricao: String?,
    @SerializedName("tipo", alternate = ["Tipo"])
    val tipo: String?,
    @SerializedName("num_utent", alternate = ["numutent", "NumUtent"])
    val numutent: Int?
)

// --- Episódio ---

data class Episodio(
    @SerializedName("cod_ep_urgenc", alternate = ["codepurgenc"])
    val codepurgenc: Int,
    @SerializedName("num_utent", alternate = ["numutent"])
    val numutent: Int,
    @SerializedName("id_hosp", alternate = ["idhosp"])
    val idhosp: Int,
    val estado: String,
    @SerializedName("data_hora_entr", alternate = ["datahoraentr"])
    val datahoraentr: String,
    @SerializedName("data_hora_saida", alternate = ["datahorasaida"])
    val datahorasaida: String?
)

// --- Triagem / Pulseira ---

data class Triagem(
    @SerializedName("cod_ep_urgenc", alternate = ["codepurgenc"])
    val codepurgenc: Int,
    @SerializedName("cor_triagem", alternate = ["cortriagem"])
    val cortriagem: String,
    val sintomas: String?,
    val temperatura: Double?,
    @SerializedName("freq_card", alternate = ["freqcard"])
    val freqcard: Int?,
    @SerializedName("freq_resp", alternate = ["freqresp"])
    val freqresp: Int?,
    val spo2: Double?,
    val sistolica: Int?,
    val diastolica: Int?,
    @SerializedName("data_hora_inicio", alternate = ["datahorainicio"])
    val datahorainicio: String?,
    @SerializedName("data_hora_fim", alternate = ["datahorafim"])
    val datahorafim: String?,
    @SerializedName("id_func", alternate = ["idfunc"])
    val idfunc: Int?
)
