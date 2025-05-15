import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

const Account = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg'
  })
  
  const [editing, setEditing] = useState(false)
  const [tempUser, setTempUser] = useState({...user})

  const handleSave = () => {
    setUser({...tempUser})
    setEditing(false)
  }

  const handleCancel = () => {
    setTempUser({...user})
    setEditing(false)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: user.profileImage }} 
            style={styles.profileImage} 
          />
          <TouchableOpacity style={styles.editImageButton}>
            <Ionicons name="camera" size={22} color="white" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.headerText}>Account Settings</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!editing ? (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={24} color="#0066cc" />
            </TouchableOpacity>
          ) : (
            <View style={styles.editButtons}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            {editing ? (
              <TextInput
                value={tempUser.name}
                onChangeText={(text) => setTempUser({...tempUser, name: text})}
                style={styles.textInput}
              />
            ) : (
              <Text style={styles.infoValue}>{user.name}</Text>
            )}
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            {editing ? (
              <TextInput
                value={tempUser.email}
                onChangeText={(text) => setTempUser({...tempUser, email: text})}
                style={styles.textInput}
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoValue}>{user.email}</Text>
            )}
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            {editing ? (
              <TextInput
                value={tempUser.phone}
                onChangeText={(text) => setTempUser({...tempUser, phone: text})}
                style={styles.textInput}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{user.phone}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="lock-closed-outline" size={22} color="#333" />
          <Text style={styles.actionText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" style={styles.actionArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="notifications-outline" size={22} color="#333" />
          <Text style={styles.actionText}>Notification Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" style={styles.actionArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#333" />
          <Text style={styles.actionText}>Privacy Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" style={styles.actionArrow} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  profileSection: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0066cc',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 200,
    textAlign: 'right',
  },
  editButtons: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    marginRight: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    color: '#666',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  actionArrow: {
    marginLeft: 'auto',
  },
  logoutButton: {
    margin: 10,
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
})

export default Account
