package com.reactnativeboilerplateapp;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

public class MainActivity extends ReactNativeBoilerplateAppActivity {

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ReactNativeBoilerplateApp";
    }

    @Override
    protected ReactNativeBoilerplateAppActivityDelegate createReactNativeBoilerplateAppActivityDelegate() {
        return new ReactNativeBoilerplateAppActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactNativeBoilerplateAppRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }
}
