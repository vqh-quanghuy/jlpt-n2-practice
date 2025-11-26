<?php
/**
 * Filter and Convert Other Words to TSV
 * Filters out existing words from n2-vocab.tsv and converts to TSV format
 */

if ($argc < 3) {
    echo "Usage: php filter-and-convert.php <other-words-file> <n2-vocab-file> [output-file]\n";
    echo "Example: php filter-and-convert.php ../data/other-words-raw.txt ../data/n2-vocab.tsv ../data/n2-other-vocabs.tsv\n";
    exit(1);
}

$otherWordsFile = $argv[1];
$n2VocabFile = $argv[2];
$outputFile = $argv[3] ?? '../data/n2-other-vocabs.tsv';

// Check input files exist
if (!file_exists($otherWordsFile)) {
    echo "Error: Other words file '$otherWordsFile' not found.\n";
    exit(1);
}

if (!file_exists($n2VocabFile)) {
    echo "Error: N2 vocab file '$n2VocabFile' not found.\n";
    exit(1);
}

echo "Processing files...\n";
echo "Input: $otherWordsFile\n";
echo "N2 Vocab: $n2VocabFile\n";
echo "Output: $outputFile\n";
echo "==========================================\n";

// Load existing N2 vocabulary (first column only)
$existingWords = [];
$n2Lines = file($n2VocabFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

foreach ($n2Lines as $line) {
    $parts = explode("\t", trim($line));
    if (!empty($parts[0])) {
        $existingWords[trim($parts[0])] = true;
    }
}

echo "Loaded " . count($existingWords) . " existing N2 vocabulary words.\n";

// Process other words file
$otherLines = file($otherWordsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$outputLines = [];
$processedCount = 0;
$filteredCount = 0;
$addedCount = 0;

foreach ($otherLines as $lineNumber => $line) {
    $actualLineNumber = $lineNumber + 1;
    $line = trim($line);
    
    if (empty($line)) continue;
    
    $processedCount++;
    
    // Split by colon
    $parts = explode(':', $line);
    $colonCount = count($parts) - 1;
    
    if ($colonCount < 1 || $colonCount > 2) {
        echo "Skipping line $actualLineNumber: Invalid format\n";
        continue;
    }
    
    // Extract components
    $word = trim($parts[0]);
    $pronunciation = '';
    $meaning = '';
    
    if ($colonCount == 1) {
        // 2-column format: word:meaning
        $meaning = trim($parts[1]);
    } else {
        // 3-column format: word:pronunciation:meaning
        $pronunciation = trim($parts[1]);
        $meaning = trim($parts[2]);
    }
    
    if (empty($word) || empty($meaning)) {
        echo "Skipping line $actualLineNumber: Empty word or meaning\n";
        continue;
    }
    
    // Check if word has special notice points (contains (, ), or =)
    $hasNoticePoints = (strpos($meaning, '(') !== false || 
                       strpos($meaning, ')') !== false || 
                       strpos($meaning, '=') !== false);
    
    // Check if word exists in N2 vocab
    $existsInN2 = isset($existingWords[$word]);
    
    // Decision logic:
    // 1. If has notice points -> always include
    // 2. If no notice points but exists in N2 -> skip
    // 3. If no notice points and doesn't exist in N2 -> include
    
    if (!$hasNoticePoints && $existsInN2) {
        $filteredCount++;
        echo "Filtered out: $word (exists in N2 vocab, no special notes)\n";
        continue;
    }
    
    // Add to output
    $tsvLine = $word . "\t" . $pronunciation . "\t" . $meaning;
    $outputLines[] = $tsvLine;
    $addedCount++;
    
    $reason = $hasNoticePoints ? "has special notes" : "new word";
    echo "Added: $word ($reason)\n";
}

// Write output file
if (!empty($outputLines)) {
    $outputDir = dirname($outputFile);
    if (!is_dir($outputDir)) {
        mkdir($outputDir, 0755, true);
    }
    
    file_put_contents($outputFile, implode("\n", $outputLines) . "\n");
    echo "\n==========================================\n";
    echo "✓ Successfully created: $outputFile\n";
} else {
    echo "\n==========================================\n";
    echo "⚠ No words to output. All words were filtered out.\n";
}

echo "Statistics:\n";
echo "- Total processed: $processedCount\n";
echo "- Filtered out: $filteredCount\n";
echo "- Added to output: $addedCount\n";
echo "- Output file lines: " . count($outputLines) . "\n";
?>