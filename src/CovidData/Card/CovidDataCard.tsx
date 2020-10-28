import React, { FunctionComponent } from "react"
import { useTranslation } from "react-i18next"
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import { useNavigation } from "@react-navigation/native"

import { HomeStackScreens } from "../../navigation"
import PercentageChart from "../PercentageChart"
import { CovidDataRequest } from "../Context"
import * as CovidData from "../covidData"

import SectionButton from "../../Home/SectionButton"
import { Text } from "../../components"

import {
  Iconography,
  Affordances,
  Colors,
  Typography,
  Spacing,
} from "../../styles"

type CovidDataCardProps = {
  dataRequest: CovidDataRequest
  locationName: string
}

const CovidDataCard: FunctionComponent<CovidDataCardProps> = ({
  dataRequest,
  locationName,
}) => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const handleOnPressCard = () => {
    navigation.navigate(HomeStackScreens.CovidDataDashboard)
  }

  const determineContent = () => {
    switch (dataRequest.status) {
      case "MISSING_INFO":
        return (
          <ErrorMessage message={t("covid_data.apologies_data_unavailable")} />
        )
      case "ERROR":
        return (
          <ErrorMessage
            message={t("covid_data.error_getting_data", {
              location: locationName,
            })}
          />
        )
      case "LOADING":
        return <LoadingIndicator />
      case "SUCCESS": {
        const percentage = CovidData.toNewCasesPercentage(dataRequest.data)
        return (
          <View testID={"covid-data"}>
            <PercentageChart
              percentage={percentage}
              label={t("covid_data.new_cases")}
            />
          </View>
        )
      }
    }
  }

  const headerText = t("covid_data.covid_stats_in", {
    location: locationName.toUpperCase(),
  })

  return (
    <TouchableOpacity
      accessibilityLabel={t("covid_data.see_more")}
      onPress={handleOnPressCard}
      style={style.container}
    >
      <Text style={style.sectionHeaderText}>{headerText}</Text>
      <View style={style.contentContainer}>{determineContent()}</View>
      <SectionButton text={t("common.more")} />
    </TouchableOpacity>
  )
}

const LoadingIndicator = () => {
  return (
    <View style={style.activityIndicatorContainer}>
      <ActivityIndicator
        size={"large"}
        color={Colors.neutral.shade100}
        style={style.activityIndicator}
        testID={"loading-indicator"}
      />
    </View>
  )
}

interface ErrorMessageProps {
  message: string
}
const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({ message }) => {
  return <Text style={style.errorMessageText}>{message}</Text>
}

const style = StyleSheet.create({
  container: {
    ...Affordances.floatingContainer,
  },
  contentContainer: {
    marginVertical: Spacing.medium,
  },
  errorMessageText: {
    ...Typography.error,
  },
  sectionHeaderText: {
    ...Typography.header3,
    marginBottom: Spacing.xxSmall,
    color: Colors.neutral.black,
  },
  activityIndicatorContainer: {
    flex: 1,
    alignItems: "center",
  },
  activityIndicator: {
    paddingVertical: Spacing.small,
    width: Iconography.xxSmall,
    height: Iconography.xxSmall,
  },
})

export default CovidDataCard