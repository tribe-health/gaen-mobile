import React, {
  createContext,
  useState,
  useEffect,
  FunctionComponent,
  useCallback,
  useContext,
} from "react"

import { failureResponse, OperationResponse } from "./OperationResponse"
import { ExposureKey } from "./exposureKey"
import { ExposureInfo } from "./exposure"
import { checkForNewExposures as detectExposures } from "./gaen/nativeModule"
import { useProductAnalyticsContext } from "./ProductAnalytics/Context"
import * as NativeModule from "./gaen/nativeModule"

type Posix = number

export interface ExposureState {
  exposureInfo: ExposureInfo
  getCurrentExposures: () => Promise<ExposureInfo>
  getExposureKeys: () => Promise<ExposureKey[]>
  getRevisionToken: () => Promise<string>
  lastExposureDetectionDate: Posix | null
  storeRevisionToken: (revisionToken: string) => Promise<void>
  refreshExposureInfo: () => void
  checkForNewExposures: () => Promise<OperationResponse>
}

const initialState = {
  exposureInfo: [],
  getCurrentExposures: () => {
    return Promise.resolve([])
  },
  getExposureKeys: () => {
    return Promise.resolve([])
  },
  getRevisionToken: () => {
    return Promise.resolve("")
  },
  lastExposureDetectionDate: null,
  storeRevisionToken: () => {
    return Promise.resolve()
  },
  refreshExposureInfo: () => {},
  checkForNewExposures: () => {
    return Promise.resolve({ kind: "success" as const })
  },
}

export const ExposureContext = createContext<ExposureState>(initialState)

const ExposureProvider: FunctionComponent = ({ children }) => {
  const { trackEvent } = useProductAnalyticsContext()

  const [exposureInfo, setExposureInfo] = useState<ExposureInfo>([])

  const [
    lastExposureDetectionDate,
    setLastExposureDetectionDate,
  ] = useState<Posix | null>(null)

  const getLastExposureDetectionDate = useCallback(() => {
    NativeModule.fetchLastExposureDetectionDate().then((detectionDate) => {
      setLastExposureDetectionDate(detectionDate)
    })
  }, [])

  const refreshExposureInfo = async () => {
    const exposureInfo = await NativeModule.getCurrentExposures()
    setExposureInfo(exposureInfo)

    const detectionDate = await NativeModule.fetchLastExposureDetectionDate()
    setLastExposureDetectionDate(detectionDate)
  }

  useEffect(() => {
    const subscription = NativeModule.subscribeToExposureEvents(
      (exposureInfo: ExposureInfo) => {
        setExposureInfo(exposureInfo)
        getLastExposureDetectionDate()
      },
    )
    getLastExposureDetectionDate()

    return () => {
      subscription.remove()
    }
  }, [getLastExposureDetectionDate])

  useEffect(() => {
    const subscription = NativeModule.subscribeToExposureEvents(() => {
      trackEvent("epi_analytics", "en_notification_received")
    })

    return () => {
      subscription.remove()
    }
  }, [trackEvent])

  const checkForNewExposures = async (): Promise<OperationResponse> => {
    try {
      const response = await detectExposures()
      if (response.kind === "failure") {
        throw new Error(response.error)
      }
      await refreshExposureInfo()
      return { kind: "success" }
    } catch (e) {
      return failureResponse(e.message)
    }
  }

  return (
    <ExposureContext.Provider
      value={{
        exposureInfo,
        lastExposureDetectionDate,
        refreshExposureInfo,
        checkForNewExposures,
        getCurrentExposures: NativeModule.getCurrentExposures,
        getExposureKeys: NativeModule.getExposureKeys,
        getRevisionToken: NativeModule.getRevisionToken,
        storeRevisionToken: NativeModule.storeRevisionToken,
      }}
    >
      {children}
    </ExposureContext.Provider>
  )
}

const useExposureContext = (): ExposureState => {
  const context = useContext(ExposureContext)
  if (context === undefined) {
    throw new Error("ExposureContext must be used with a provider")
  }
  return context
}

export { ExposureProvider, useExposureContext }
