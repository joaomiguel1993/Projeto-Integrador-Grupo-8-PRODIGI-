package pt.siaguh.app.ui

import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import pt.siaguh.app.data.api.RetrofitClient
import pt.siaguh.app.data.model.LoginResponse
import pt.siaguh.app.data.repository.AuthRepository
import pt.siaguh.app.data.repository.UtenteRepository
import pt.siaguh.app.ui.login.LoginScreen
import pt.siaguh.app.ui.login.LoginViewModel
import pt.siaguh.app.ui.paciente.PacienteScreen
import pt.siaguh.app.ui.paciente.PacienteViewModel
import pt.siaguh.app.ui.scanner.ScannerScreen
import pt.siaguh.app.util.TokenManager

object Routes {
    const val LOGIN   = "login"
    const val SCANNER = "scanner"
    const val PACIENTE = "paciente"
}

@Composable
fun SiaguhNavHost() {
    val context = LocalContext.current
    val tokenManager = remember { TokenManager(context) }
    val api = remember { RetrofitClient.create(tokenManager) }
    val authRepository = remember { AuthRepository(api = api, tokenManager = tokenManager) }
    val utenteRepository = remember { UtenteRepository(api) }

    val navController = rememberNavController()
    var loginResponse by remember { mutableStateOf<LoginResponse?>(null) }
    var numUtenteAtivo by remember { mutableStateOf<Int?>(null) }

    NavHost(navController = navController, startDestination = Routes.LOGIN) {

        composable(Routes.LOGIN) {
            val viewModel: LoginViewModel = viewModel(factory = LoginViewModel.Factory(authRepository))
            LoginScreen(
                viewModel = viewModel,
                onLoginSuccess = { response ->
                    loginResponse = response
                    navController.navigate(Routes.SCANNER) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.SCANNER) {
            val lr = loginResponse ?: return@composable
            ScannerScreen(
                nomeUtilizador = lr.nome,
                role = lr.role,
                onUtenteScanned = { numUtente ->
                    numUtenteAtivo = numUtente
                    navController.navigate(Routes.PACIENTE)
                },
                onLogout = {
                    loginResponse = null
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(Routes.SCANNER) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.PACIENTE) {
            val viewModel: PacienteViewModel = viewModel(
                factory = PacienteViewModel.Factory(utenteRepository)
            )
            val numUtente = numUtenteAtivo ?: return@composable

            LaunchedEffect(numUtente) {
                viewModel.carregarPaciente(numUtente)
            }

            PacienteScreen(
                viewModel = viewModel,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
