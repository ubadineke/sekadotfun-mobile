import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';

interface SuccessModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export function SuccessModal({ visible, onClose, title = "Success!", message }: SuccessModalProps) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={['#0F0C29', '#302B63']}
                        style={styles.modalContent}
                    >
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={['#22C55E', '#16A34A']}
                                style={styles.iconGradient}
                            >
                                <Text style={styles.iconText}>✓</Text>
                            </LinearGradient>
                        </View>
                        <Text style={styles.title}>{title}</Text>
                        {message && <Text style={styles.message}>{message}</Text>}

                        <TouchableOpacity style={styles.button} onPress={onClose}>
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>Continue</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    modalContent: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 16,
    },
    iconGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    message: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
