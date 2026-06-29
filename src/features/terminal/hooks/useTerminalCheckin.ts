import { useState, useRef, useCallback, useEffect } from "react";
import { startCameraStream, stopCameraStream, captureFrameFromVideo } from "@/utils/camera.util";
import { isBiometricLivenessRequired } from "@/config/biometric";
import { terminalCheckin } from "@/service/terminal.service";
import { api } from "@/config/api";
import { API_ROUTES, AUTH_PATHS, buildRoute } from "@/config/api-routes";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import type { TerminalStep, TerminalCheckinResult } from "@/types/terminal";

const COUNTDOWN_SECONDS = 10;

export function useTerminalCheckin() {
  const [step, setStep] = useState<TerminalStep>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<TerminalCheckinResult | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const latRef = useRef<number>(0);
  const lonRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    stopCameraStream(streamRef.current);
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setStep("starting");
    setErrorMessage(null);

    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        latRef.current = pos.coords.latitude;
        lonRef.current = pos.coords.longitude;
      },
      () => {}
    );

    try {
      const stream = await startCameraStream();
      streamRef.current = stream;
      setStep("camera_ready");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Não foi possível acessar a câmera.";
      setErrorMessage(msg);
      setStep("error");
    }
  }, []);

  // Attach stream to video element when camera becomes ready
  useEffect(() => {
    if (step === "camera_ready" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [step]);

  const capture = useCallback(async () => {
    if (!videoRef.current || step !== "camera_ready") return;

    setStep("capturing");

    try {
      const dataUrl = captureFrameFromVideo(videoRef.current);
      const base64 = dataUrl.split(",")[1];

      stopCamera();
      setStep("submitting");

      const livenessPassed = isBiometricLivenessRequired() ? true : undefined;
      const checkinResult = await terminalCheckin({
        faceImageBase64: base64,
        livenessPassed,
        latitude: latRef.current,
        longitude: lonRef.current,
      });

      setResult(checkinResult);
      setCountdown(COUNTDOWN_SECONDS);
      setStep("success");
    } catch (err: unknown) {
      stopCamera();
      const msg = getServiceErrorMessage(err, "Erro ao registrar ponto. Tente novamente.");
      setErrorMessage(msg);
      setStep("error");
    }
  }, [step, stopCamera]);

  const retry = useCallback(() => {
    setErrorMessage(null);
    setResult(null);
    startCamera();
  }, [startCamera]);

  // Countdown after success → logout → reset camera
  useEffect(() => {
    if (step !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          api
            .post(buildRoute(API_ROUTES.AUTH, AUTH_PATHS.LOGOUT))
            .catch(() => {})
            .finally(() => {
              setResult(null);
              setCountdown(COUNTDOWN_SECONDS);
              startCamera();
            });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, startCamera]);

  // Start camera on mount, stop on unmount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return { step, errorMessage, result, countdown, videoRef, capture, retry };
}
