### React Native Android Keyboard Avoiding & Animation Constraints

When developing chat interfaces or text input areas inside dashboard layouts with transitions:
1. **Never Nest `KeyboardAvoidingView` Inside Dynamic Transform Wrappers**: On Android, `<KeyboardAvoidingView>` components nested inside `<Animated.View>` containers that utilize translation properties (`transform: [{ translateX / translateY }]`) fail to measure layout bounds correctly. This leaves text inputs obscured by the soft keyboard.
2. **Architectural Separation**: Keep any interactive input screens (like `ChatArea` or `SOSChatArea`) entirely sibling to or outside of `<Animated.View>` wrappers. Render tab transition containers and chat components conditionally at the root of the screen container layout.
3. **Avoid Transform Key Deletion Crashes**: Never dynamically add/delete the `transform` property from an active `Animated.View` style array, as React Native's native style validators will crash. Always keep transform declarations consistent or move the view components outside the transform scope entirely.
4. **FlatList/ScrollView Squeezing**: Wrap messages lists or loaded contents in a stable `<View style={{ flex: 1 }}>` container so that when the outer `<KeyboardAvoidingView behavior="height">` resizes, the inner lists shrink accurately, keeping bottom input controls visible.
