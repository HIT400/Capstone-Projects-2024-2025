extension PhoneNumberFormatter on String {
  String formatPhoneNumber() {
    String cleaned = replaceAll(RegExp(r'[^\d+]'), '');
    if (cleaned.startsWith('+')) {
      return cleaned.replaceFirstMapped(RegExp(r'(\+\d{1,3})(\d{3})(\d{3})(\d{3,4})'),
              (match) => '${match[1]} ${match[2]} ${match[3]} ${match[4]}');
    }
    return cleaned.replaceFirstMapped(RegExp(r'(\d{2})(\d{3})(\d{3})(\d{2})'),
            (match) => '${match[1]} ${match[2]} ${match[3]} ${match[4]}');
  }
}
