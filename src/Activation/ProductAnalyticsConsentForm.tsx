import React, { FunctionComponent } from "react"
import {
  Linking,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

import { useConfigurationContext } from "../ConfigurationContext"
import { useProductAnalyticsContext } from "../ProductAnalytics/Context"
import { ActivationStackScreens, useStatusBarEffect } from "../navigation"
import { useCustomCopy } from "../configuration/useCustomCopy"
import { Text } from "../components"

import { Colors, Typography, Spacing, Buttons } from "../styles"

const ProductAnalyticsConsentForm: FunctionComponent = () => {
  useStatusBarEffect("dark-content", Colors.secondary.shade10)
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { healthAuthorityPrivacyPolicyUrl } = useConfigurationContext()
  const { healthAuthorityName } = useCustomCopy()
  const { updateUserConsent } = useProductAnalyticsContext()

  const handleOnPressYes = async () => {
    updateUserConsent(true)
    navigation.navigate(ActivationStackScreens.ActivateExposureNotifications)
  }

  const handleOnPressMaybeLater = () => {
    navigation.navigate(ActivationStackScreens.ActivateExposureNotifications)
  }

  const handleOnPressPrivacyPolicy = () => {
    Linking.openURL(healthAuthorityPrivacyPolicyUrl)
  }
  const privacyPolicyLinkText = t("product_analytics.privacy_policy")

  const buttonText = t("product_analytics.i_understand_and_consent")

  return (
    <ScrollView
      style={style.container}
      contentContainerStyle={style.contentContainer}
      alwaysBounceVertical={false}
    >
      <Text style={style.headerText}>
        {t("product_analytics.share_anonymized_data")}
      </Text>
      <View style={style.paragraphContainer}>
        <Text style={style.paragraph}>
          {t("product_analytics.share_data_para_1", {
            healthAuthorityName,
          })}
        </Text>
      </View>
      <View style={style.paragraphContainer}>
        <Text style={style.paragraphBold}>
          {t("product_analytics.share_data_para_2", {
            healthAuthorityName,
          })}
        </Text>
      </View>
      <View style={style.privacyPolicyLinkContainer}>
        <TouchableOpacity
          onPress={handleOnPressPrivacyPolicy}
          accessibilityLabel={privacyPolicyLinkText}
        >
          <Text style={style.privacyPolicyLinkText}>
            {privacyPolicyLinkText}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={style.buttonsContainer}>
        <TouchableOpacity
          style={style.button}
          onPress={handleOnPressYes}
          accessibilityLabel={buttonText}
        >
          <Text style={style.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleOnPressMaybeLater}
          style={style.secondaryButton}
          accessibilityLabel={t("common.maybe_later")}
        >
          <Text style={style.secondaryButtonText}>
            {t("common.maybe_later")}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={style.disclaimer}>
        {t("product_analytics.share_anonymized_data_disclaimer", {
          healthAuthorityName,
        })}
      </Text>
    </ScrollView>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primaryLight,
  },
  contentContainer: {
    paddingVertical: Spacing.large,
    paddingHorizontal: Spacing.large,
  },
  headerText: {
    ...Typography.header.x60,
    marginBottom: Spacing.large,
  },
  paragraphContainer: {
    marginBottom: Spacing.medium,
  },
  paragraph: {
    ...Typography.body.x30,
  },
  paragraphBold: {
    ...Typography.body.x30,
    ...Typography.style.bold,
  },
  privacyPolicyLinkContainer: {
    marginBottom: Spacing.huge,
  },
  privacyPolicyLinkText: {
    ...Typography.button.anchorLink,
  },
  buttonsContainer: {
    marginBottom: Spacing.huge,
  },
  button: {
    ...Buttons.primary.base,
  },
  buttonText: {
    ...Typography.button.primary,
  },
  secondaryButton: {
    ...Buttons.secondary.base,
  },
  secondaryButtonText: {
    ...Typography.button.secondary,
  },
  disclaimer: {
    ...Typography.body.x20,
  },
})

export default ProductAnalyticsConsentForm
