package pt.siaguh.app.ui.scanner

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.OptIn
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.Executors

/**
 * Ecrã de scan QR.
 * Utiliza CameraX e Google ML Kit para leitura em tempo real.
 */
@Composable
fun ScannerScreen(
    nomeUtilizador: String,
    role: String,
    onUtenteScanned: (Int) -> Unit,
    onLogout: () -> Unit,
) {
    val context = LocalContext.current

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
    }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { granted -> hasCameraPermission = granted }
    )

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            launcher.launch(Manifest.permission.CAMERA)
        }
    }

    var inputCodEpisodio by remember { mutableStateOf("") }
    var erro by remember { mutableStateOf<String?>(null) }
    var isScanning by remember { mutableStateOf(true) }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(16.dp))
        Text("Olá, $nomeUtilizador", fontSize = 16.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(
            roleLabel(role),
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        Text(
            "Scan QR da Pulseira",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        Text(
            "Aponta a câmara para o QR code da pulseira",
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        // Área da Câmara
        Box(
            modifier = Modifier
                .size(260.dp)
                .background(Color.Black, shape = MaterialTheme.shapes.medium),
            contentAlignment = Alignment.Center
        ) {
            if (hasCameraPermission) {
                if (isScanning) {
                    CameraPreview(
                        onBarcodeDetected = { code ->
                            val id = code.toIntOrNull()
                            if (id != null && isScanning) {
                                isScanning = false // Evita leituras múltiplas
                                onUtenteScanned(id)
                            }
                        }
                    )
                } else {
                    CircularProgressIndicator(color = Color.White)
                }
            } else {
                Text(
                    "Sem permissão de câmara",
                    color = Color.White,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }

        Spacer(Modifier.height(24.dp))
        Text("Ou introduz manualmente:", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = inputCodEpisodio,
            onValueChange = { inputCodEpisodio = it.filter { c -> c.isDigit() }; erro = null },
            label = { Text("Cód. Episódio") },
            singleLine = true,
            isError = erro != null,
            supportingText = erro?.let { { Text(it, color = MaterialTheme.colorScheme.error) } },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        Button(
            onClick = {
                val num = inputCodEpisodio.toIntOrNull()
                if (num == null || num <= 0) erro = "Código de episódio inválido."
                else onUtenteScanned(num)
            },
            modifier = Modifier.fillMaxWidth().height(52.dp)
        ) {
            Text("Consultar Episódio", fontSize = 16.sp)
        }

        Spacer(Modifier.weight(1f))

        TextButton(onClick = onLogout) {
            Text("Terminar Sessão", color = MaterialTheme.colorScheme.error)
        }
        Spacer(Modifier.height(16.dp))
    }
}

@Composable
fun CameraPreview(onBarcodeDetected: (String) -> Unit) {
    val lifecycleOwner = LocalLifecycleOwner.current
    val cameraExecutor = remember { Executors.newSingleThreadExecutor() }
    val scanner = remember { BarcodeScanning.getClient() }

    AndroidView(
        factory = { ctx ->
            val previewView = PreviewView(ctx)
            val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)

            cameraProviderFuture.addListener({
                val cameraProvider = cameraProviderFuture.get()

                val preview = Preview.Builder().build().also {
                    it.setSurfaceProvider(previewView.surfaceProvider)
                }

                val imageAnalysis = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()
                    .also { analysis ->
                        analysis.setAnalyzer(cameraExecutor) { imageProxy ->
                            processImageProxy(scanner, imageProxy, onBarcodeDetected)
                        }
                    }

                try {
                    cameraProvider.unbindAll()
                    cameraProvider.bindToLifecycle(
                        lifecycleOwner,
                        CameraSelector.DEFAULT_BACK_CAMERA,
                        preview,
                        imageAnalysis
                    )
                } catch (e: Exception) {
                    Log.e("ScannerScreen", "Erro ao ligar câmara: ${e.message}")
                }
            }, ContextCompat.getMainExecutor(ctx))

            previewView
        },
        modifier = Modifier.fillMaxSize()
    )
}

@OptIn(ExperimentalGetImage::class)
private fun processImageProxy(
    barcodeScanner: com.google.mlkit.vision.barcode.BarcodeScanner,
    imageProxy: ImageProxy,
    onBarcodeDetected: (String) -> Unit
) {
    val mediaImage = imageProxy.image
    if (mediaImage != null) {
        val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
        barcodeScanner.process(image)
            .addOnSuccessListener { barcodes ->
                for (barcode in barcodes) {
                    barcode.rawValue?.let { value ->
                        onBarcodeDetected(value)
                    }
                }
            }
            .addOnFailureListener {
                Log.e("ScannerScreen", "Erro no scanner: ${it.message}")
            }
            .addOnCompleteListener {
                imageProxy.close()
            }
    } else {
        imageProxy.close()
    }
}

private fun roleLabel(role: String) = when (role) {
    "medico"       -> "Médico"
    "enfermeiro"   -> "Enfermeiro"
    "admin"        -> "Administrador"
    "rececionista" -> "Rececionista"
    else           -> role
}
