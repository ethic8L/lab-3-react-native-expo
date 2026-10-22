import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';

type HeroClass = 'wojownik' | 'paladyn' | 'czarodziej';
type StatKey = 'siła' | 'wytrzymałość' | 'zwinność' | 'magia';

type Hero = {
  imie: string;
  klasa: HeroClass;
  siła: number;
  wytrzymałość: number;
  zwinność: number;
  magia: number;
  obrazek: string | null;
};

const MAX_STAT = 10;
const TOTAL_POINTS = 20;

const CLASSES: { label: string; value: HeroClass; description: string }[] = [
  { label: 'Wojownik', value: 'wojownik', description: 'Siła i walka wręcz' },
  { label: 'Paladyn', value: 'paladyn', description: 'Obrona i równowaga' },
  { label: 'Czarodziej', value: 'czarodziej', description: 'Magia i zaklęcia' },
];

const AVATARS = [
  { id: '1', uri: 'https://api.dicebear.com/7.x/pixel-art/png?seed=Warrior' },
  { id: '2', uri: 'https://api.dicebear.com/7.x/pixel-art/png?seed=Paladin' },
  { id: '3', uri: 'https://api.dicebear.com/7.x/pixel-art/png?seed=Mage' },
  { id: '4', uri: 'https://api.dicebear.com/7.x/pixel-art/png?seed=Rogue' },
  { id: '5', uri: 'https://api.dicebear.com/7.x/pixel-art/png?seed=Cleric' },
  { id: '6', uri: 'https://api.dicebear.com/7.x/pixel-art/png?seed=Elf' },
];

const INITIAL_HERO: Hero = {
  imie: '',
  klasa: 'wojownik',
  siła: 5,
  wytrzymałość: 7,
  zwinność: 5,
  magia: 3,
  obrazek: AVATARS[0].uri,
};

export default function MainScreen() {
  const [hero, setHero] = useState<Hero>(INITIAL_HERO);
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);

  const clickPlayer = useAudioPlayer(
  require('../../assets/sounds/click.mp3')
);
const interfacePlayer = useAudioPlayer(
  require('../../assets/sounds/interface.mp3')
);
const approvePlayer = useAudioPlayer(
  require('../../assets/sounds/approve.mp3')
);

const playSound = (
  player: typeof clickPlayer
) => {
  player.seekTo(0);
  player.play();
};

  const usedPoints =
    hero.siła + hero.wytrzymałość + hero.zwinność + hero.magia;
  const remainingPoints = TOTAL_POINTS - usedPoints;
  const isFormValid = hero.imie.trim().length > 0 && remainingPoints === 0;
  const selectedClass =
    CLASSES.find((item) => item.value === hero.klasa) ?? CLASSES[0];

  const changeStat = (statName: StatKey, amount: number) => {
    const currentValue = hero[statName];
    const nextValue = currentValue + amount;

    if (nextValue < 0 || nextValue > MAX_STAT) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (amount > 0 && remainingPoints < amount) {
      Alert.alert('Brak punktów', 'Nie masz już wolnych punktów do rozdania.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setHero((current) => ({ ...current, [statName]: nextValue }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const generateHero = () => {
    Keyboard.dismiss();
    if (!hero.imie.trim()) {
      Alert.alert('Brak imienia', 'Wpisz imię swojego bohatera.');
      return;
    }
    if (remainingPoints !== 0) {
      Alert.alert(
        'Nie rozdano wszystkich punktów',
        `Pozostało Ci ${remainingPoints} pkt. Rozdaj wszystkie 20 punktów.`,
      );
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSummaryVisible(true);
  };

  const renderStat = (label: string, key: StatKey) => {
    const value = hero[key];
    const width = `${(value / MAX_STAT) * 100}%`;

    return (
      <View style={styles.statCard} key={key}>
        <View style={styles.statHeading}>
          <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
          <Text style={styles.statValue}>{value}<Text style={styles.statMax}> / {MAX_STAT}</Text></Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width, backgroundColor: value >= 8 ? '#ef5350' : '#4caf50' },
            ]}
          />
        </View>
        <View style={styles.statControls}>
          <Pressable
            accessibilityLabel={`Zmniejsz ${label}`}
            style={({ pressed }) => [styles.statButton, pressed && styles.pressed]}
            onPress={() => changeStat(key, -1)}
          >
            <Text style={styles.statButtonText}>−</Text>
          </Pressable>
          <Text style={styles.statNumber}>{value}</Text>
          <Pressable
            accessibilityLabel={`Zwiększ ${label}`}
            style={({ pressed }) => [styles.statButton, pressed && styles.pressed]}
            onPress={() => changeStat(key, 1)}
          >
            <Text style={styles.statButtonText}>+</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>CHARACTER</Text>
          <Text style={styles.titleAccent}>GENERATOR</Text>
          <Text style={styles.subtitle}>Stwórz bohatera swojej przygody</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelTop}>
            <View>
              <Text style={styles.sectionKicker}>KARTA POSTACI</Text>
              <Text style={styles.sectionTitle}>Nowy bohater</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsNumber}>{remainingPoints}</Text>
              <Text style={styles.pointsCaption}>PUNKTÓW</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>IMIĘ BOHATERA</Text>
          <TextInput
            style={styles.input}
            value={hero.imie}
            onChangeText={(imie) => setHero((current) => ({ ...current, imie }))}
            placeholder="Np. Aragorn"
            placeholderTextColor="#85858d"
            maxLength={15}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            selectionColor="#ffd740"
            underlineColorAndroid="transparent"
            accessibilityLabel="Imię bohatera"
          />
          <Text style={styles.helperText}>Maksymalnie 15 znaków</Text>

          <Text style={[styles.fieldLabel, styles.classLabel]}>WYBIERZ KLASĘ</Text>
          <Pressable
            style={({ pressed }) => [styles.classSelector, pressed && styles.pressed]}
            onPress={() => {
              Keyboard.dismiss();
              setClassModalVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Wybrana klasa: ${selectedClass.label}. Zmień klasę`}
          >
            <View style={styles.classIcon}>
              <Text style={styles.classIconText}>
                {hero.klasa === 'wojownik' ? '⚔' : hero.klasa === 'paladyn' ? '🛡' : '✦'}
              </Text>
            </View>
            <View style={styles.classCopy}>
              <Text style={styles.className}>{selectedClass.label}</Text>
              <Text style={styles.classDescription}>{selectedClass.description}</Text>
            </View>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>

          <View style={styles.sectionDivider} />
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text style={styles.sectionKicker}>WYGLĄD</Text>
              <Text style={styles.sectionTitle}>Wybierz awatar</Text>
            </View>
            <Text style={styles.mutedText}>PIXEL ART</Text>
          </View>
          <View style={styles.avatarGrid}>
            {AVATARS.map((avatar) => {
              const selected = hero.obrazek === avatar.uri;
              return (
                <Pressable
                  key={avatar.id}
                  onPress={() => {
                    setHero((current) => ({ ...current, obrazek: avatar.uri }));
                    Haptics.selectionAsync();
                  }}
                  style={({ pressed }) => [
                    styles.avatarContainer,
                    selected && styles.avatarSelected,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Wybierz awatar ${avatar.id}`}
                >
                  <Image source={{ uri: avatar.uri }} style={styles.avatarImage} />
                  {selected && <View style={styles.selectedDot}><Text style={styles.selectedDotText}>✓</Text></View>}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionDivider} />
          <View style={styles.sectionHeadingRow}>
            <View>
              <Text style={styles.sectionKicker}>ROZWÓJ</Text>
              <Text style={styles.sectionTitle}>Statystyki</Text>
            </View>
            <Text style={styles.mutedText}>MAX. {MAX_STAT}</Text>
          </View>
          <Text style={styles.statHint}>
            Rozdaj dokładnie {TOTAL_POINTS} punktów między cztery cechy.
          </Text>
          <View style={styles.statsContainer}>
            {renderStat('Siła', 'siła')}
            {renderStat('Wytrzymałość', 'wytrzymałość')}
            {renderStat('Zwinność', 'zwinność')}
            {renderStat('Magia', 'magia')}
          </View>

          <View style={styles.validationRow}>
            <View style={[styles.validationDot, remainingPoints === 0 && styles.validationDotDone]} />
            <Text style={styles.validationText}>
              {remainingPoints > 0
                ? `Do rozdania: ${remainingPoints} pkt`
                : remainingPoints < 0
                  ? `Przekroczono pulę o ${Math.abs(remainingPoints)} pkt`
                  : 'Wszystkie punkty rozdane'}
            </Text>
          </View>

          <Pressable
            onPress={generateHero}
            style={({ pressed }) => [
              styles.generateButton,
              !isFormValid && styles.generateButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.generateButtonText}>GENERUJ POSTAĆ</Text>
            <Text style={styles.generateArrow}>→</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>TWOJA PRZYGODA ZACZYNA SIĘ TUTAJ</Text>
      </ScrollView>

      <Modal
        visible={classModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setClassModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setClassModalVisible(false)}>
          <Pressable style={styles.classModal} onPress={() => undefined}>
            <Text style={styles.modalKicker}>WYBIERZ POSTAĆ</Text>
            <Text style={styles.modalTitle}>Klasa bohatera</Text>
            {CLASSES.map((item) => {
              const selected = hero.klasa === item.value;
              return (
                <Pressable
                  key={item.value}
                  style={[styles.classOption, selected && styles.classOptionSelected]}
                  onPress={() => {
                    setHero((current) => ({ ...current, klasa: item.value }));
                    setClassModalVisible(false);
                    Haptics.selectionAsync();
                  }}
                >
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.classOptionName}>{item.label}</Text>
                    <Text style={styles.classDescription}>{item.description}</Text>
                  </View>
                  <Text style={styles.optionCheck}>{selected ? '✓' : '+'}</Text>
                </Pressable>
              );
            })}
            <Pressable style={styles.cancelButton} onPress={() => setClassModalVisible(false)}>
              <Text style={styles.cancelText}>ANULUJ</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={summaryVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSummaryVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.summaryModal}>
            <Text style={styles.modalKicker}>KARTA GOTOWA</Text>
            <Text style={styles.modalTitle}>{hero.imie.trim()}</Text>
            {hero.obrazek && <Image source={{ uri: hero.obrazek }} style={styles.modalImage} />}
            <Text style={styles.summaryClass}>{selectedClass.label}</Text>
            {(['siła', 'wytrzymałość', 'zwinność', 'magia'] as StatKey[]).map((key) => (
              <View style={styles.summaryRow} key={key}>
                <Text style={styles.summaryLabel}>{key.toUpperCase()}</Text>
                <Text style={styles.summaryValue}>{hero[key]} / {MAX_STAT}</Text>
              </View>
            ))}
            <Pressable style={styles.generateButton} onPress={() => setSummaryVisible(false)}>
              <Text style={styles.generateButtonText}>GOTOWE</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#101014' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 22, paddingBottom: 28, alignItems: 'center' },
  header: { width: '100%', alignItems: 'center', marginBottom: 22 },
  eyebrow: { color: '#ffd740', fontSize: 10, fontWeight: '800', letterSpacing: 3, marginBottom: 9 },
  title: { color: '#f5f2e8', fontSize: 31, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  titleAccent: { color: '#ffd740', fontSize: 31, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  subtitle: { color: '#9999a4', fontSize: 13, marginTop: 9, textAlign: 'center' },
  panel: { width: '100%', maxWidth: 520, backgroundColor: '#1b1b22', borderColor: '#34343d', borderWidth: 1, borderRadius: 22, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  panelTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  sectionKicker: { color: '#ffd740', fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 5 },
  sectionTitle: { color: '#f5f2e8', fontSize: 20, fontWeight: '800' },
  pointsBadge: { backgroundColor: '#292922', borderColor: '#5c501c', borderWidth: 1, borderRadius: 12, minWidth: 75, paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center' },
  pointsNumber: { color: '#ffd740', fontSize: 22, fontWeight: '900' },
  pointsCaption: { color: '#b9ad77', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  fieldLabel: { color: '#c6c6cf', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  input: { width: '100%', minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: '#484852', backgroundColor: '#111116', paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 10, color: '#fff', fontSize: 16, fontWeight: '600', textAlignVertical: 'center' },
  helperText: { color: '#777782', fontSize: 10, marginTop: 6 },
  classLabel: { marginTop: 22 },
  classSelector: { width: '100%', minHeight: 68, borderRadius: 13, borderWidth: 1, borderColor: '#484852', backgroundColor: '#24242c', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
  classIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#383321', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  classIconText: { color: '#ffd740', fontSize: 23 },
  classCopy: { flex: 1 },
  className: { color: '#f7f5ed', fontSize: 15, fontWeight: '800' },
  classDescription: { color: '#92929d', fontSize: 11, marginTop: 4 },
  chevron: { color: '#ffd740', fontSize: 24, paddingHorizontal: 7 },
  sectionDivider: { height: 1, backgroundColor: '#34343d', marginVertical: 22 },
  sectionHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  mutedText: { color: '#777782', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 10 },
  avatarContainer: { width: '30%', aspectRatio: 1, maxWidth: 94, borderRadius: 14, borderWidth: 1, borderColor: '#44444e', backgroundColor: '#121217', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 5 },
  avatarSelected: { borderWidth: 2, borderColor: '#ffd740', backgroundColor: '#302c1b' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  selectedDot: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#ffd740', alignItems: 'center', justifyContent: 'center' },
  selectedDotText: { color: '#171717', fontSize: 11, fontWeight: '900' },
  statHint: { color: '#8d8d98', fontSize: 11, lineHeight: 16, marginTop: -5, marginBottom: 14 },
  statsContainer: { gap: 10 },
  statCard: { backgroundColor: '#24242c', borderRadius: 13, borderWidth: 1, borderColor: '#34343d', padding: 12 },
  statHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 },
  statLabel: { color: '#e8e6de', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, flexShrink: 1 },
  statValue: { color: '#ffd740', fontSize: 13, fontWeight: '900' },
  statMax: { color: '#777782', fontWeight: '500' },
  progressTrack: { height: 6, backgroundColor: '#111116', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 5 },
  statControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12 },
  statButton: { width: 34, height: 32, borderRadius: 9, borderWidth: 1, borderColor: '#5c501c', backgroundColor: '#302c1b', alignItems: 'center', justifyContent: 'center' },
  statButtonText: { color: '#ffd740', fontSize: 21, fontWeight: '700', lineHeight: 24 },
  statNumber: { color: '#f5f2e8', fontSize: 13, fontWeight: '800', minWidth: 18, textAlign: 'center' },
  validationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 12, gap: 8 },
  validationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffd740' },
  validationDotDone: { backgroundColor: '#4caf50' },
  validationText: { color: '#a6a6b0', fontSize: 11 },
  generateButton: { width: '100%', minHeight: 54, borderRadius: 13, backgroundColor: '#ffd740', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 6 },
  generateButtonDisabled: { opacity: 0.65 },
  generateButtonText: { color: '#171717', fontSize: 13, fontWeight: '900', letterSpacing: 1.3 },
  generateArrow: { color: '#171717', fontSize: 20, fontWeight: '800', marginLeft: 10 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  footer: { color: '#62626d', fontSize: 9, letterSpacing: 2, textAlign: 'center', marginTop: 22, marginBottom: 5 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  classModal: { width: '100%', maxWidth: 420, backgroundColor: '#1b1b22', borderRadius: 20, borderWidth: 1, borderColor: '#484852', padding: 20 },
  modalKicker: { color: '#ffd740', fontSize: 9, fontWeight: '800', letterSpacing: 2, textAlign: 'center', marginBottom: 7 },
  modalTitle: { color: '#f5f2e8', fontSize: 23, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  classOption: { minHeight: 66, borderRadius: 12, borderWidth: 1, borderColor: '#3a3a44', backgroundColor: '#24242c', paddingHorizontal: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  classOptionSelected: { borderColor: '#ffd740', backgroundColor: '#302c1b' },
  optionTextWrap: { flex: 1 },
  classOptionName: { color: '#f5f2e8', fontSize: 15, fontWeight: '800' },
  optionCheck: { color: '#ffd740', fontSize: 20, fontWeight: '900', marginLeft: 12 },
  cancelButton: { alignItems: 'center', paddingVertical: 13, marginTop: 3 },
  cancelText: { color: '#aaaab4', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  summaryModal: { width: '100%', maxWidth: 380, backgroundColor: '#1b1b22', borderRadius: 20, borderWidth: 1, borderColor: '#ffd740', padding: 22, alignItems: 'center' },
  modalImage: { width: 96, height: 96, marginBottom: 12, borderRadius: 14, backgroundColor: '#24242c' },
  summaryClass: { color: '#ffd740', fontSize: 13, fontWeight: '800', marginBottom: 18 },
  summaryRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#34343d' },
  summaryLabel: { color: '#b5b5bf', fontSize: 11, fontWeight: '700' },
  summaryValue: { color: '#f5f2e8', fontSize: 12, fontWeight: '800' },
});
