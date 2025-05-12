import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Link } from 'expo-router';
import Logo from '../assets/img/parkme_logo.png';
import DateTimePicker from '@react-native-community/datetimepicker';

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const countryCodes = [
    { code: '+1', name: 'USA' },
    { code: '+44', name: 'UK' },
    { code: '+91', name: 'India' },
    { code: '+81', name: 'Japan' },
    { code: '+33', name: 'France' },
    { code: '+233', name: 'Ghana' },
    // Add more country codes as needed
  ];

  const validatePassword = (text) => {
    setPassword(text);
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    
    if (!text) {
      setPasswordError('Password is required');
    } else if (text.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else if (!strongRegex.test(text)) {
      setPasswordError('Password must contain uppercase, lowercase, number, and special character');
    } else {
      setPasswordError('');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Handle sign up logic here
    console.log({
      firstName,
      lastName,
      email,
      phone: `${countryCode}${phone}`,
      dateOfBirth,
      password
    });
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Image source={Logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Create Account</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John"
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Doe"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{formatDate(dateOfBirth)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneInputContainer}>
          <View style={styles.countryCodeContainer}>
            <Picker
              style={styles.countryCodePicker}
              selectedValue={countryCode}
              onValueChange={(itemValue) => setCountryCode(itemValue)}
              dropdownIconColor="#666"
              mode="dropdown"
            >
              {countryCodes.map((country) => (
                <Picker.Item 
                  key={country.code} 
                  label={`${country.code}`} 
                  value={country.code} 
                />
              ))}
            </Picker>
          </View>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Create password"
          secureTextEntry
          value={password}
          onChangeText={validatePassword}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        <Text style={styles.passwordHint}>
          Password must contain:
        </Text>
        <View style={styles.passwordRules}>
          <Text style={password.length >= 8 ? styles.ruleMet : styles.rule}>• At least 8 characters</Text>
          <Text style={/[A-Z]/.test(password) ? styles.ruleMet : styles.rule}>• Uppercase letter</Text>
          <Text style={/[a-z]/.test(password) ? styles.ruleMet : styles.rule}>• Lowercase letter</Text>
          <Text style={/[0-9]/.test(password) ? styles.ruleMet : styles.rule}>• Number</Text>
          <Text style={/[!@#$%^&*]/.test(password) ? styles.ruleMet : styles.rule}>• Special character</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity style={styles.signUpButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.loginPrompt}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <Link href="/login" style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Log In</Text>
        </Link>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#2c3e50',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#34495e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryCodeContainer: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    height: 50,
    overflow: 'hidden',
  },
  countryCodePicker: {
    width: '100%',
    height: Platform.OS === 'android' ? 50 : 120, // Smaller height for Android
    marginTop: Platform.OS === 'android' ? -10 : 0,
    marginBottom: Platform.OS === 'android' ? -10 : 0,
  },
  phoneInput: {
    flex: 2,
  },
  passwordRules: {
    marginTop: 10,
    paddingLeft: 15,
  },
  passwordHint: {
    marginTop: 10,
    color: '#7f8c8d',
    fontSize: 14,
  },
  rule: {
    color: '#e74c3c',
    fontSize: 12,
  },
  ruleMet: {
    color: '#2ecc71',
    fontSize: 12,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
  },
  signUpButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: '#7f8c8d',
  },
  loginLinkText: {
    color: '#3498db',
    fontWeight: '600',
  },
});

export default SignUp;