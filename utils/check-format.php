<?php
/**
 * Format Checker for Other Words File
 * Checks for format errors in the input text file
 */

if ($argc < 2) {
    echo "Usage: php check-format.php <input-file>\n";
    echo "Example: php check-format.php ../data/other-words-raw.txt\n";
    exit(1);
}

$inputFile = $argv[1];

if (!file_exists($inputFile)) {
    echo "Error: File '$inputFile' not found.\n";
    exit(1);
}

echo "Checking format of: $inputFile\n";
echo "==========================================\n";

$lines = file($inputFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$errorCount = 0;

foreach ($lines as $lineNumber => $line) {
    $actualLineNumber = $lineNumber + 1;
    $line = trim($line);
    
    if (empty($line)) continue;
    
    // Count colons
    $colonCount = substr_count($line, ':');
    
    // Check for format errors
    $hasError = false;
    $errorMessage = '';
    
    if ($colonCount > 2) {
        $hasError = true;
        $errorMessage = "Too many colons ($colonCount found, max 2 allowed)";
    } elseif ($colonCount < 1) {
        $hasError = true;
        $errorMessage = "Not enough colons ($colonCount found, min 1 required)";
    } else {
        // Split by colon and check parts
        $parts = explode(':', $line);
        
        if ($colonCount == 1) {
            // 2-column format: word:meaning
            if (empty(trim($parts[0])) || empty(trim($parts[1]))) {
                $hasError = true;
                $errorMessage = "Empty column detected in 2-column format";
            }
        } elseif ($colonCount == 2) {
            // 3-column format: word:pronunciation:meaning
            if (empty(trim($parts[0])) || empty(trim($parts[2]))) {
                $hasError = true;
                $errorMessage = "Empty word or meaning column in 3-column format";
            }
            // Note: pronunciation (parts[1]) can be empty for hiragana/katakana words
        }
    }
    
    if ($hasError) {
        echo "Line $actualLineNumber: $errorMessage\n";
        echo "  Content: $line\n";
        echo "  Colons found: $colonCount\n\n";
        $errorCount++;
    }
}

echo "==========================================\n";
if ($errorCount == 0) {
    echo "✓ No format errors found! File is ready for processing.\n";
} else {
    echo "✗ Found $errorCount format error(s). Please fix them before processing.\n";
}
echo "Total lines checked: " . count($lines) . "\n";
?>