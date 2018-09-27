import React from 'react';
import { 
    ActivityIndicator,
    Text, View,
    StyleSheet
} from 'react-native';


const loadingView = () => {
    return(
        <View style={styles.loadingContainer}>
          <ActivityIndicator/>
          <Text style={styles.title}>Laddar</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 30,
        color: '#e73737',
    }
});

export default loadingView;
