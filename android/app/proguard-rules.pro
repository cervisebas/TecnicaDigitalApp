# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# @notifee/react-native
-keep class io.invertase.notifee.** { *; }
-dontwarn io.invertase.notifee.**

# @react-native-async-storage/async-storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-dontwarn com.reactnativecommunity.asyncstorage.**

# @react-native-community/datetimepicker
-keep class com.reactcommunity.rndatetimepicker.** { *; }
-dontwarn com.reactcommunity.rndatetimepicker.**

# @react-native-firebase
-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**
-keep class io.invertase.firebase.messaging.** { *; }
-dontwarn io.invertase.firebase.messaging.**

# @react-native-picker/picker
-keep class com.reactnativecommunity.picker.** { *; }
-dontwarn com.reactnativecommunity.picker.**

# react-native-date-picker
-keep class com.henninghall.date_picker.** { *; }
-dontwarn com.henninghall.date_picker.**
-keep public class net.time4j.android.ApplicationStarter
-keep public class net.time4j.PrettyTime

# react-native-device-info
-keep class com.learnium.RNDeviceInfo.** { *; }
-dontwarn com.learnium.RNDeviceInfo.**
-keep class com.google.android.gms.common.** { *; }
-keepclassmembers class com.android.installreferrer.api.** { *; }

# react-native-file-viewer
-keep class com.vinzscam.reactnativefileviewer.** { *; }
-dontwarn com.vinzscam.reactnativefileviewer.**

# react-native-fs
-keep class com.rnfs.** { *; }
-dontwarn com.rnfs.**

# react-native-gesture-handler
-keep class com.swmansion.gesturehandler.** { *; }
-dontwarn com.swmansion.gesturehandler.**

# react-native-html-to-pdf
-keep class com.christopherdro.htmltopdf.** { *; }
-dontwarn com.christopherdro.htmltopdf.**

# react-native-pager-view
-keep class com.reactnativepagerview.** { *; }
-dontwarn com.reactnativepagerview.**

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

# react-native-safe-area-context
-keep class com.th3rdwave.safeareacontext.** { *; }
-dontwarn com.th3rdwave.safeareacontext.**

# react-native-screens
-keep class com.swmansion.rnscreens.** { *; }
-dontwarn com.swmansion.rnscreens.**

# react-native-svg
-keep class com.horcrux.svg.** { *; }

# react-native-system-navigation-bar
-keep class com.reactnativesystemnavigationbar.** { *; }
-dontwarn com.reactnativesystemnavigationbar.**

# react-native-vector-icons
-keep class com.oblador.vectoricons.** { *; }
-dontwarn com.oblador.vectoricons.**

# react-native-view-shot
-keep class fr.greweb.reactnativeviewshot.** { *; }
-dontwarn fr.greweb.reactnativeviewshot.**

# react-native-share
-keep class com.swmansion.rnscreens.** { *; }
-dontwarn com.swmansion.rnscreens.**

# react-native-fast-image
-keep public class com.dylanvann.fastimage.* {*;}
-keep public class com.dylanvann.fastimage.** {*;}
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

# @react-native-masked-view/masked-view
-keep class org.reactnative.maskedview.** { *; }
-dontwarn org.reactnative.maskedview.**

# react-native-linear-gradient
-keep class com.BV.LinearGradient.** { *; }
-dontwarn com.BV.LinearGradient.**

# react-native-image-crop-picker
-keep class com.reactnative.ivpusic.imagepicker.** { *; }
-dontwarn com.reactnative.ivpusic.imagepicker.**
-keep class com.yalantis.ucrop** { *; }
-dontwarn com.yalantis.ucrop**
-keep interface com.yalantis.ucrop** { *; }

# react-native-version-check
-keep class io.xogus.reactnative.versioncheck.** { *; }
-dontwarn io.xogus.reactnative.versioncheck.**

# com.github.zjupure:webpdecoder
-keep public class com.bumptech.glide.integration.webp.WebpImage { *; }
-keep public class com.bumptech.glide.integration.webp.WebpFrame { *; }
-keep public class com.bumptech.glide.integration.webp.WebpBitmapFactory { *; }

# react-native-splash-screen
-keep class org.devio.rn.splashscreen.** { *; }
-dontwarn org.devio.rn.splashscreen.**

# @shopify/react-native-skia
#-keep class com.shopify.reactnative.skia.** { *; }
#-dontwarn com.shopify.reactnative.skia.**

# @adrianso/react-native-device-brightness
-keep class org.capslock.RNDeviceBrightness.** { *; }
-dontwarn org.capslock.RNDeviceBrightness.**