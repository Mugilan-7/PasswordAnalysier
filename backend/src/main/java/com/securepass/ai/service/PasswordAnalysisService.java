package com.securepass.ai.service;

import com.securepass.ai.dto.*;
import com.securepass.ai.entity.PasswordAnalysisHistory;
import com.securepass.ai.entity.User;
import com.securepass.ai.repository.PasswordAnalysisHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PasswordAnalysisService {

    private final PasswordAnalysisHistoryRepository historyRepository;
    private final SecureRandom random = new SecureRandom();

    // Pool sizes for entropy calculations
    private static final int POOL_LOWERCASE = 26;
    private static final int POOL_UPPERCASE = 26;
    private static final int POOL_NUMBERS = 10;
    private static final int POOL_SYMBOLS = 32;

    // Character pools for password generation
    private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String NUMBERS = "0123456789";
    private static final String SYMBOLS = "!@#$%^&*()_+-=[]{}|;:',.<>/?";

    // Ambiguous/similar characters to exclude if requested
    private static final String SIMILAR_CHARS = "lI1oO0s5S2Z";

    public PasswordAnalysisService(PasswordAnalysisHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public AnalysisResponse analyzePassword(String password, User user) {
        // Character breakdown
        int length = password.length();
        int uppercase = 0;
        int lowercase = 0;
        int numbers = 0;
        int symbols = 0;

        for (char c : password.toCharArray()) {
            if (Character.isLowerCase(c)) lowercase++;
            else if (Character.isUpperCase(c)) uppercase++;
            else if (Character.isDigit(c)) numbers++;
            else symbols++;
        }

        // Calculate pool size
        int poolSize = 0;
        if (lowercase > 0) poolSize += POOL_LOWERCASE;
        if (uppercase > 0) poolSize += POOL_UPPERCASE;
        if (numbers > 0) poolSize += POOL_NUMBERS;
        if (symbols > 0) poolSize += POOL_SYMBOLS;
        if (poolSize == 0) poolSize = 1; // Safeguard

        // Entropy: H = L * log2(R)
        double entropy = length * (Math.log(poolSize) / Math.log(2));

        // Score logic (0 to 100)
        int score = calculateScore(password, length, uppercase, lowercase, numbers, symbols, entropy);

        // Grade mapping
        String grade;
        if (score < 40) grade = "Weak";
        else if (score < 60) grade = "Fair";
        else if (score < 80) grade = "Good";
        else if (score < 90) grade = "Strong";
        else grade = "Excellent";

        // Brute-force crack time estimates (in seconds)
        // Assume an offline GPU cluster capable of 10 billion (1e10) hashes/sec
        double guesses = Math.pow(poolSize, length);
        long crackTimeSeconds;
        if (guesses > Long.MAX_VALUE) {
            crackTimeSeconds = Long.MAX_VALUE;
        } else {
            crackTimeSeconds = (long) (guesses / 1e10);
            if (crackTimeSeconds < 0) crackTimeSeconds = Long.MAX_VALUE; // overflow check
        }
        
        String crackTimeEstimated = formatCrackTime(guesses);

        // HIBP check proxy
        Map<String, Object> pwnedResult = checkHIBPBreach(password);
        boolean pwned = (boolean) pwnedResult.get("pwned");
        int breachCount = (int) pwnedResult.get("breachCount");

        // AI Advisor suggestions
        List<String> suggestions = generateSuggestions(password, length, uppercase, lowercase, numbers, symbols, pwned);

        // Save history if user is authenticated
        if (user != null) {
            PasswordAnalysisHistory history = PasswordAnalysisHistory.builder()
                    .user(user)
                    .score(score)
                    .entropy(entropy)
                    .grade(grade)
                    .crackTimeEstimated(crackTimeEstimated)
                    .crackTimeSeconds(crackTimeSeconds)
                    .characterCount(length)
                    .uppercaseCount(uppercase)
                    .lowercaseCount(lowercase)
                    .numbersCount(numbers)
                    .specialCount(symbols)
                    .build();
            historyRepository.save(history);
        }

        return AnalysisResponse.builder()
                .score(score)
                .entropy(entropy)
                .grade(grade)
                .crackTimeEstimated(crackTimeEstimated)
                .crackTimeSeconds(crackTimeSeconds)
                .characterCount(length)
                .uppercaseCount(uppercase)
                .lowercaseCount(lowercase)
                .numbersCount(numbers)
                .specialCount(symbols)
                .suggestions(suggestions)
                .pwned(pwned)
                .breachCount(breachCount)
                .build();
    }

    private int calculateScore(String password, int length, int uppercase, int lowercase, int numbers, int symbols, double entropy) {
        if (length == 0) return 0;

        int score = 0;

        // Length contribution (up to 40 pts)
        score += Math.min(length * 3, 35);
        if (length >= 12) score += 5; // Bonus for good length

        // Character set diversity contribution (up to 40 pts)
        int categories = 0;
        if (lowercase > 0) { score += 8; categories++; }
        if (uppercase > 0) { score += 10; categories++; }
        if (numbers > 0) { score += 10; categories++; }
        if (symbols > 0) { score += 12; categories++; }
        
        // Bonus for rich diversity
        if (categories >= 4) {
            score += 10;
        }

        // Entropy contribution (up to 20 pts)
        score += Math.min((int)(entropy / 3), 20);

        // Deductions
        // Consecutive identical characters
        int consecutiveCount = 0;
        for (int i = 0; i < length - 1; i++) {
            if (password.charAt(i) == password.charAt(i + 1)) {
                consecutiveCount++;
            }
        }
        score -= consecutiveCount * 4;

        // Sequential numbers (e.g. 123) or letters (abc)
        if (password.matches(".*(012|123|234|345|456|567|678|789|abc|bcd|cde|qwe|asd).*")) {
            score -= 15;
        }

        // Entirely numeric or entirely alphabetic
        if (numbers == length || (lowercase + uppercase) == length) {
            score -= 15;
        }

        // Ensure score is bounded between 0 and 100
        return Math.max(0, Math.min(100, score));
    }

    private String formatCrackTime(double guesses) {
        // Attack speeds:
        // Offline GPU cluster doing 10 billion (1e10) hashes per second
        double seconds = guesses / 1e10;

        if (seconds < 1) return "instant";
        if (seconds < 60) return String.format("%.0f seconds", seconds);
        
        double minutes = seconds / 60;
        if (minutes < 60) return String.format("%.0f minutes", minutes);
        
        double hours = minutes / 60;
        if (hours < 24) return String.format("%.0f hours", hours);
        
        double days = hours / 24;
        if (days < 30) return String.format("%.0f days", days);
        
        double months = days / 30;
        if (months < 12) return String.format("%.0f months", months);
        
        double years = months / 12;
        if (years < 1000) return String.format("%.0f years", years);
        if (years < 1e6) return String.format("%.0f millennia", years / 1000);
        return "eternity (millions of years)";
    }

    private List<String> generateSuggestions(String password, int length, int uppercase, int lowercase, int numbers, int symbols, boolean pwned) {
        List<String> suggestions = new ArrayList<>();

        if (pwned) {
            suggestions.add("CRITICAL: This password was found in a public data breach. Change it immediately.");
        }
        if (length < 12) {
            suggestions.add("Increase length to at least 12-16 characters. Length is the single most important security factor.");
        }
        if (uppercase == 0) {
            suggestions.add("Add uppercase letters (A-Z) to increase diversity.");
        }
        if (lowercase == 0) {
            suggestions.add("Add lowercase letters (a-z) to increase diversity.");
        }
        if (numbers == 0) {
            suggestions.add("Add numbers (0-9) to defend against dictionary attacks.");
        }
        if (symbols == 0) {
            suggestions.add("Add special characters (e.g. @, #, $, !) to create a complex keyboard layout footprint.");
        }
        
        // Sequential/Repeated checks
        int consecutiveCount = 0;
        for (int i = 0; i < length - 1; i++) {
            if (password.charAt(i) == password.charAt(i + 1)) {
                consecutiveCount++;
            }
        }
        if (consecutiveCount > 1) {
            suggestions.add("Avoid repeating patterns of characters (e.g., 'aa', '777') to reduce compression predictability.");
        }

        if (password.toLowerCase().contains("password") || password.toLowerCase().contains("secure") || password.toLowerCase().contains("admin")) {
            suggestions.add("Avoid using easily guessed dictionary terms like 'password', 'secure', or 'admin'.");
        }

        if (suggestions.isEmpty()) {
            suggestions.add("Excellent job! This password meets all core cryptographic recommendations.");
        }

        return suggestions;
    }

    public PasswordUpgradeResponse upgradePassword(String password) {
        // Build upgrades preserving memorability
        StringBuilder upgraded = new StringBuilder();
        
        // Character replacements mapping (Leet speak replacements that are easy to remember)
        Map<Character, Character> leetMap = new HashMap<>();
        leetMap.put('a', '@');
        leetMap.put('A', '@');
        leetMap.put('o', '0');
        leetMap.put('O', '0');
        leetMap.put('e', '3');
        leetMap.put('E', '3');
        leetMap.put('i', '1');
        leetMap.put('I', '1');
        leetMap.put('s', '$');
        leetMap.put('S', '$');
        leetMap.put('t', '7');
        leetMap.put('T', '7');

        boolean replacedAny = false;
        for (char c : password.toCharArray()) {
            if (leetMap.containsKey(c) && random.nextBoolean()) {
                upgraded.append(leetMap.get(c));
                replacedAny = true;
            } else {
                upgraded.append(c);
            }
        }

        // If length is short, append/prepend secure blocks
        if (upgraded.length() < 12) {
            // Capitalize first letter if it was lowercase
            if (upgraded.length() > 0 && Character.isLowerCase(upgraded.charAt(0))) {
                upgraded.setCharAt(0, Character.toUpperCase(upgraded.charAt(0)));
            }
            // Append symbol and secure year/suffix
            upgraded.append("#2026!");
        } else {
            // Just add some random special character at the end if none exists
            boolean hasSymbol = false;
            for (char c : upgraded.toString().toCharArray()) {
                if (!Character.isLetterOrDigit(c)) {
                    hasSymbol = true;
                    break;
                }
            }
            if (!hasSymbol) {
                upgraded.append("!");
            }
        }

        String finalUpgraded = upgraded.toString();
        
        // Calculate scores
        int origScore = calculateScore(password, password.length(), 0, 0, 0, 0, 0); // basic score proxy
        AnalysisResponse origAnal = analyzePassword(password, null);
        AnalysisResponse upgAnal = analyzePassword(finalUpgraded, null);

        String explanation = "Upgraded password security by: " +
                (finalUpgraded.length() > password.length() ? "increasing the character length, " : "") +
                "adding specialized character substitutions (like leetspeak symbols), " +
                "and appending symbols for maximum keyboard entropy.";

        return PasswordUpgradeResponse.builder()
                .originalPassword(password)
                .upgradedPassword(finalUpgraded)
                .explanation(explanation)
                .originalScore(origAnal.getScore())
                .upgradedScore(upgAnal.getScore())
                .build();
    }

    public String generatePassword(PasswordGenerationRequest request) {
        StringBuilder pool = new StringBuilder();
        List<String> requiredSets = new ArrayList<>();

        // Exclude similar characters filter
        String activeLower = request.isExcludeSimilar() || request.isEasyToRead() ? filterSimilar(LOWERCASE) : LOWERCASE;
        String activeUpper = request.isExcludeSimilar() || request.isEasyToRead() ? filterSimilar(UPPERCASE) : UPPERCASE;
        String activeNumbers = request.isExcludeSimilar() || request.isEasyToRead() ? filterSimilar(NUMBERS) : NUMBERS;
        String activeSymbols = request.isExcludeSimilar() || request.isEasyToRead() ? filterSimilar(SYMBOLS) : SYMBOLS;

        // Custom easy to type mappings
        if (request.isEasyToType()) {
            // Limit symbols to easily reachable on main keyboard rows
            activeSymbols = "!@#$%^&*()_+-=";
        }

        if (request.isIncludeLowercase()) {
            pool.append(activeLower);
            requiredSets.add(activeLower);
        }
        if (request.isIncludeUppercase()) {
            pool.append(activeUpper);
            requiredSets.add(activeUpper);
        }
        if (request.isIncludeNumbers()) {
            pool.append(activeNumbers);
            requiredSets.add(activeNumbers);
        }
        if (request.isIncludeSymbols()) {
            pool.append(activeSymbols);
            requiredSets.add(activeSymbols);
        }

        if (pool.length() == 0) {
            // Fallback
            pool.append(activeLower).append(activeNumbers);
            requiredSets.add(activeLower);
            requiredSets.add(activeNumbers);
        }

        char[] password = new char[request.getLength()];
        
        // First ensure one character from each selected set is included
        int idx = 0;
        for (String set : requiredSets) {
            if (idx < password.length) {
                password[idx++] = set.charAt(random.nextInt(set.length()));
            }
        }

        // Fill remaining spaces with random chars from pool
        for (int i = idx; i < password.length; i++) {
            password[i] = pool.charAt(random.nextInt(pool.length()));
        }

        // Shuffle generated array
        for (int i = password.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = password[i];
            password[i] = password[j];
            password[j] = temp;
        }

        return new String(password);
    }

    private String filterSimilar(String source) {
        StringBuilder filtered = new StringBuilder();
        for (char c : source.toCharArray()) {
            if (SIMILAR_CHARS.indexOf(c) == -1) {
                filtered.append(c);
            }
        }
        return filtered.toString();
    }

    public Map<String, Object> checkHIBPBreach(String password) {
        Map<String, Object> result = new HashMap<>();
        result.put("pwned", false);
        result.put("breachCount", 0);

        try {
            // Calculate SHA-1 hash of password
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hashBytes = digest.digest(password.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            
            // Convert to Hex uppercase
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            String fullHash = hexString.toString().toUpperCase();
            
            String prefix = fullHash.substring(0, 5);
            String suffix = fullHash.substring(5);

            // Call API
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(3))
                    .build();
            
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.pwnedpasswords.com/range/" + prefix))
                    .header("User-Agent", "SecurePass-AI-App")
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                String body = response.body();
                String[] lines = body.split("\n");
                for (String line : lines) {
                    String[] parts = line.trim().split(":");
                    if (parts.length == 2) {
                        String returnedSuffix = parts[0].toUpperCase();
                        int count = Integer.parseInt(parts[1]);
                        if (returnedSuffix.equals(suffix)) {
                            result.put("pwned", true);
                            result.put("breachCount", count);
                            break;
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Fallback gracefully on timeout, network issue, or API failure
            System.err.println("HIBP API check failed, falling back gracefully: " + e.getMessage());
        }

        return result;
    }
}
