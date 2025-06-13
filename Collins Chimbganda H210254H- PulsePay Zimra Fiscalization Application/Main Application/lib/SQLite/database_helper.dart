import 'package:intl/intl.dart';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import 'package:pulsepay/JsonModels/json_models.dart';

class DatabaseHelper {
  final databaseName = "pulse.db";

  /////=========TABLES=========//////////
  ///
  

  String dailyReports=
    "create table dailyReports(ID INTEGER PRIMARY KEY AUTOINCREMENT, reportDate TEXT , reportTime TEXT , FiscalDayNo INTEGER , SaleByTaxUSD REAL , SaleByTaxZWG REAL , SaleTaxByTaxUSD REAL , SaleTaxByTaxZWG REAL , CreditNoteByTaxUSD REAL , CreditNoteByTaxZWG REAL , CreditNoteTaxByTaxUSD REAL , CreditNoteTaxByTaxZWG REAL, BalanceByMoneyTypeCashUSD REAL , BalanceByMoneyTypeCashZWG REAL , BalanceByMoneyTypeCardUSD REAL , BalanceByMoneyTypeCardZWG REAL , BalanceByMoneyTypeMobileWalletUSD REAl , BalanceByMoneyTypeMobileWalletZWG REAL , BalanceByMoneyTypeCouponUSD REAL , BalanceByMoneyTypeCouponZWG REAL , BalanceByMoneyTypeInvoiceUSD REAL , BalanceByMoneyTypeInvoiceZWG REAL , BalanceByMoneyTypeBankTransferUSD REAL , BalanceByMoneyTypeBankTransferZWG REAL , BalanceByMoneyTypeOtherUSD REAL ,BalanceByMoneyTypeOtherZWG REAL ,reportHash TEXT , reportSignature TEXT , reportJsonBody TEXT , fiscalDayStatus TEXT)";
  
  String openDay= 
   "create table openDay(ID INTEGER PRIMARY KEY AUTOINCREMENT , FiscalDayNo INTEGER , StatusOfFirstReceipt TEXT , FiscalDayOpened TEXT , FiscalDayClosed TEXT , TaxExempt INTEGER , TaxZero INTEGER , Tax15 INTEGER , TaxWT INTEGER )";

  String submittedReceipts=
   "create table submittedReceipts(receiptGlobalNo INTEGER PRIMARY KEY AUTOINCREMENT , receiptCounter INTEGER ,  FiscalDayNo INTEGER , InvoiceNo INTEGER , receiptID INTEGER , receiptType TEXT , receiptCurrency TEXT , moneyType TEXT , receiptDate TEXT , receiptTime TEXT , receiptTotal REAL , taxCode TEXT , taxPercent TEXT , taxAmount REAL , SalesAmountwithTax REAL, receiptHash TEXT , receiptJsonbody TEXT , StatustoFDMS TEXT , qrurl TEXT , receiptServerSignature TEXT , submitReceiptServerresponseJSON TEXT, Total15VAT TEXT , TotalNonVAT REAL , TotalExempt REAL , TotalWT REAL  )";

  String users = 
    "create table users(userId INTEGER PRIMARY KEY AUTOINCREMENT,realName TEXT , userName TEXT UNIQUE , userPassword TEXT , dateCreated TEXT , isAdmin INTEGER DEFAULT 0 ,isCashier INTEGER DEFAULT 0 , isActive INTEGER DEFAULT 1)";
  
  String products =
    "create table products(productid INTEGER PRIMARY KEY AUTOINCREMENT, productName TEXT UNIQUE , barcode TEXT,hsCode INTEGER , costPrice REAL , sellingPrice REAL , sellqty REAL , tax TEXT , stockQty INTEGER DEFAULT 0)";

  String invoices =
    "create table invoices (invoiceId INTEGER PRIMARY KEY AUTOINCREMENT,date TEXT,totalAmount REAL,totalTax REAL , currency TEXT)";

  String stockPurchases =
    "create table stockPurchases ( purchaseId INTEGER PRIMARY KEY AUTOINCREMENT , date TEXT , productid INTEGER , quantity INTEGER , payMethod TEXT, supplier TEXT ,FOREIGN KEY(productid) REFERENCES products(productid))";

  String sales = 
    "CREATE TABLE sales (saleId INTEGER PRIMARY KEY AUTOINCREMENT,invoiceId INTEGER,customerID INTEGER,productId INTEGER,quantity INTEGER,sellingPrice REAL,tax REAL , currency TEXT ,FOREIGN KEY(invoiceId) REFERENCES invoices(invoiceId),FOREIGN KEY(productId) REFERENCES products(productid), FOREIGN KEY(customerID) REFERENCES customers(customerID) )";
  
  String customers =
    "CREATE TABLE customer(customerID INTEGER PRIMARY KEY AUTOINCREMENT , tradeName TEXT , tinNumber INT , vatNumber INT , address TEXT , email TEXT)";
  // vat zero ex

  String companyDetails =
    "create table companyDetails(companyID INTEGER PRIMARY KEY AUTOINCREMENT , company TEXT , logo TEXT , address, TEXT , tel TEXT , branchName TEXT , tel2 TEXT , email TEXT , tinNumber TEXT, vatNumber TEXT ,vendorNumber TEXT , website TEXT , bank TEXT ,bankBranch TEXT , bankAcntName TEXT , bankAcntNo TEXT , baseCurreny , backUpLocation TEXT , baseTaxPercentage REAL)";
  
  String paymentMethods =
    "create table paymentMethods (payMethodId INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT , rate REAL , fiscalGroup INTEGER , currency TEXT , vatNumber TEXT , tinNumber TEXT , defaultMethod INTEGER DEFAULT 0 )";

  String receiptAnomallies = "create table receiptAnomallies (anomallyId INTEGER PRIMARY KEY AUTOINCREMENT , receiptGlobalNo INTEGER ,isAnomaly INTEGER , score REAL , receiptTotal REAL , taxAmount REAL , salesAmountWithTax REAL , taxPercent TEXT)";
   
  //====DATABASE FUNCTIONS =======/////////


  // Future<Database> initDB() async {
  //   final databasePath = await getDatabasesPath();
  //   final path = join(databasePath , databaseName);
  //   //Sawait deleteDatabase(path);

  //   return openDatabase(path , version: 1 , onCreate: (db, version) async {
  //     await db.execute(users);
  //     await db.execute(products);
  //     await db.execute(invoices);
  //     await db.execute(sales);
  //     await db.execute(customers);
  //     await db.execute(stockPurchases);
  //     await db.execute(companyDetails);
  //     await db.execute(paymentMethods);
  //     await db.execute(openDay);
  //     await db.execute(submittedReceipts);
  //     //await db.execute(dailyReports);
  //   }  , onUpgrade: (db ,oldVersion , newVersion) async {
  //     if(oldVersion > 2){
  //       await db.execute(products);
  //     }
  //   });
  // }
  Future<Database> initDB() async {
  final databasePath = await getDatabasesPath();
  final path = join(databasePath, databaseName);

  return openDatabase(
    path,
    version: 5, // ✅ bumped version
    onCreate: (db, version) async {
      // ✅ Tables created for new installs
      await db.execute(users);
      await db.execute(products);
      await db.execute(invoices);
      await db.execute(sales);
      await db.execute(customers);
      await db.execute(stockPurchases);
      await db.execute(companyDetails);
      await db.execute(paymentMethods);
      await db.execute(openDay);
      await db.execute(submittedReceipts);
      // await db.execute(dailyReports); // add when needed
    },
    onUpgrade: (db, oldVersion, newVersion) async {
      if (oldVersion < 2) {
        // ✅ Schema changes introduced in version 2
        await db.execute(
          '''CREATE TABLE IF NOT EXISTS credit_notes (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              receiptGlobalNo TEXT,
              receiptID TEXT,
              receiptDate TEXT,
              receiptTotal REAL,
              receiptNotes TEXT,
              creditNoteNumber TEXT
            )'''
        );
      }

      // future version upgrades:
      if (oldVersion < 3) {
        // v3 adds the `cancelled` flag to invoices
        await db.execute(
          'ALTER TABLE invoices ADD COLUMN cancelled INTEGER NOT NULL DEFAULT 0'
        );
      }
      if (oldVersion<4){
        await db.execute(receiptAnomallies);
      }
      if(oldVersion < 5){
        await db.execute(
          'ALTER TABLE invoices ADD COLUMN cancelled INTEGER NOT NULL DEFAULT 0'
        );
        await db.execute(receiptAnomallies);
        await db.execute(
          '''CREATE TABLE IF NOT EXISTS credit_notes (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              receiptGlobalNo TEXT,
              receiptID TEXT,
              receiptDate TEXT,
              receiptTotal REAL,
              receiptNotes TEXT,
              creditNoteNumber TEXT
            )'''
        );
      }
    },
  );
}


  Future<bool> login(Users user) async{
    final Database db = await initDB();
    var result = await db.rawQuery("select * from users where userName = '${user.userName}' AND userPassword='${user.userPassword}' ");
    if (result.isNotEmpty){
      return true;
    }else{
      return false;
    }
  }
   // Fetch sales data for reports
  Future<List<Map<String, dynamic>>> getSalesReport(String period) async {
    final db = await initDB();
    String query = "";

    if (period == "Daily") {
      query = "SELECT totalAmount, strftime('%Y-%m-%d', date) as date FROM invoices GROUP BY date";
    } else if (period == "Weekly") {
      query = "SELECT totalAmount, strftime('%Y-%W', date) as date FROM invoices GROUP BY date";
    } else if (period == "Monthly") {
      query = "SELECT totalAmount, strftime('%Y-%m', date) as date FROM invoices GROUP BY date";
    }
    return await db.rawQuery(query);
  }
  //signup
  Future<int> signup(Users user)async{
    final Database db = await initDB();
    return db.insert('users', user.toMap());
  }

  Future<int> insertReceipt(SubmittedReceipt receiptData) async {
    final db = await initDB();
    return await db.insert('submittedReceipts', receiptData.toMap());
    }

  Future<int> addReceipt(SubmittedReceipt receipt) async{
    final Database db = await initDB();
    return db.insert('submittedReceipts', receipt.toMap());
  }
  //add products
  Future<int> addProduct(Products product) async{
    final Database db = await initDB();
    return db.insert('products', product.toMap());
  }

  //add products
  Future<int> addCompanyDetails(CompanyDetails companyDetails) async{
    final Database db = await initDB();
    return db.insert('companyDetails', companyDetails.toMap());
  }

  //add products
  Future<int> addPayMethod(PaymentMethod paymentMethod) async{
    final Database db = await initDB();
    return db.insert('paymentMethods', paymentMethod.toMap());
  }

  //Add Stock Purchase
  Future<int> addStockPurchase(StockPurchase stockPurchase) async{
    final Database db = await initDB();
    return db.insert('stockPurchases', stockPurchase.toMap());
  }

  //Add Customer 

  Future<int> addCustomer(Customer customer) async{
    final Database db = await initDB();
    return db.insert('customer', customer.toMap());
  }

  //search for customer
  Future<List<Map<String, dynamic>>> searchCustomer(String query) async {
    final Database db = await initDB();
    return db.query(
      'customer',
      where: 'tradeName LIKE ?',
      whereArgs: ['%$query%'],
    );
  }

  //search for products
  Future<List<Map<String, dynamic>>> searchProducts(String query) async {
    final Database db = await initDB();
    return db.query(
      'products',
      where: 'productName LIKE ?',
      whereArgs: ['%$query%'],
    );
  }

  //Get product sales
  Future<List<Map<String, dynamic>>> getProductSales(int productId) async {
    final db = await initDB();
    return await db.rawQuery('''
      SELECT sales.*, invoices.date
      FROM sales
      INNER JOIN invoices ON sales.invoiceId = invoices.invoiceId
      WHERE sales.productId = ?
    ''', [productId]);
  }

  //invoice numbers
  Future<int> getNextInvoiceId() async {
    final db = await initDB();
    final result = await db.rawQuery('SELECT MAX(invoiceId) as lastId FROM invoices');
    int lastId = result.first['lastId'] as int? ?? 0; // Start at 0 if no invoices
    return lastId + 1;
  }
  
  Future<int> getNextReceiptGlobalNo() async {
    final db = await initDB();
    final result = await db.rawQuery('SELECT MAX(receiptGlobalNo) as lastGlobalNo FROM submittedReceipts');
    int lastGlobalNo = result.first['lastGlobalNo'] as int? ?? 0; // Start at 0 if no invoices
    return lastGlobalNo + 1;
  }

  //save sale
  Future<void> saveSale(List<Map<String, dynamic>> cartItems, double totalAmount, double totalTax , double indiTax , int customerID) async {
  final db = await initDB();
  final int invoiceId = await getNextInvoiceId();
  final String date = DateTime.now().toIso8601String();

  // Start a transaction
  await db.transaction((txn) async {
    // Insert into invoices table
    await txn.insert('invoices', {
      'invoiceId': invoiceId,
      'date': date,
      'totalAmount': totalAmount,
      'totalTax': totalTax,
    });

    // Insert into sales table
    for (var item in cartItems) {
      await txn.insert('sales', {
        'invoiceId': invoiceId,
        'customerID': customerID,
        'productId': item['productid'],
        'quantity': item['sellqty'],
        'sellingPrice': item['sellingPrice'],
        'tax': indiTax, // Calculate per-item tax if necessary
      });
    }
  });
}

//Get all sales
    Future<List<Map<String, dynamic>>> getAllSales() async {
      final db = await initDB();
      final query = '''
        SELECT 
        invoices.invoiceId,
        invoices.date,
        products.productName,
        sales.quantity,
        sales.sellingPrice,
        (sales.quantity * sales.sellingPrice) AS totalPrice,
        sales.tax
        FROM sales
        INNER JOIN invoices ON sales.invoiceId = invoices.invoiceId
        INNER JOIN products ON sales.productId = products.productid
        ORDER BY invoices.date DESC
        ''';

        return await db.rawQuery(query);
      }

      //Get all invoices
      Future<List<Map<String, dynamic>>> getAllInvoices() async {
        final db = await initDB();
        final query = '''
          SELECT 
          invoices.invoiceId,
          invoices.date,
          COUNT(sales.productId) AS totalItems,
          SUM(sales.quantity * sales.sellingPrice) AS totalPrice,
          SUM(sales.tax) AS totalTax
          FROM invoices
          INNER JOIN sales ON invoices.invoiceId = sales.invoiceId
          GROUP BY invoices.invoiceId
          ORDER BY invoices.date DESC
          ''';
      return await db.rawQuery(query);
      }
    

    ///Search Invoices By Invoice Number
    Future<List<Map<String, dynamic>>> searchInvoicesByNumber(String invoiceNumber) async {
      final db = await initDB();
      final query = '''
        SELECT 
        invoices.invoiceId,
        invoices.date,
        COUNT(sales.productId) AS totalItems,
        SUM(sales.quantity * sales.sellingPrice) AS totalPrice
        FROM invoices
        INNER JOIN sales ON invoices.invoiceId = sales.invoiceId
        WHERE invoices.invoiceId LIKE ?
        GROUP BY invoices.invoiceId
        ''';

      return await db.rawQuery(query, ['%$invoiceNumber%']);
    }
    
    ///Cancel Invoice
    Future<void> cancelInvoice(int invoiceId) async {
      final db = await initDB();
      await db.update(
        'invoices',
        { 'cancelled': 1 },
        where: 'invoiceId = ?',
        whereArgs: [invoiceId],
      );
      await db.delete(
        'sales',
        where: 'invoiceId = ?',
        whereArgs: [invoiceId],
      );
    }

    //Delete Paymenth method
     Future<void> deletePayMethod(int methodId) async{
      final db = await initDB();
      await db.delete(
        'paymentMethods',
        where: 'payMethodId = ?',
        whereArgs: [methodId],
      );
     }


    ////Get Sales By Invoice
    Future<List<Map<String, dynamic>>> getSalesByInvoice(int invoiceId) async {
      final db = await initDB(); // Initialize the database
        return await db.rawQuery('''
          SELECT sales.*, products.productName 
          FROM sales
          INNER JOIN products ON sales.productId = products.productId
          WHERE sales.invoiceId = ?
        ''', [invoiceId]);
    }

    ///Get Product By ID
    Future<List<Map<String, dynamic>>> getProductById(int productid) async{
      final db = await initDB();
      return await db.rawQuery('''
        SELECT products.*
        FROM products
        WHERE products.productid = ?
      ''' , [productid]);
    }

    //Get Default Currency
    Future<List<Map<String,dynamic>>> getDefaultPayMethod(int defaultTag) async{
      final db = await initDB();
      return await db.rawQuery('''
        SELECT paymentMethods.*
        FROM paymentMethods
        WHERE paymentMethods.payMethodId = ?
      ''' , [defaultTag]);
    }

    Future<String?> getDefaultCurrency() async {
      final db = await initDB(); // Ensure your `initDB` initializes the database
      final result = await db.rawQuery('''
        SELECT currency 
        FROM paymentMethods
        WHERE defaultMethod = 1
        LIMIT 1
      ''');

      if (result.isNotEmpty) {
        return result[0]['currency'] as String; // Return the currency
      }
      return null; // Return null if no default method is set
  }

    Future<double?> getDefaultRate() async {
      final db = await initDB(); // Ensure your `initDB` initializes the database
      final result = await db.rawQuery('''
        SELECT rate 
        FROM paymentMethods
        WHERE defaultMethod = 1
        LIMIT 1
      ''');

      if (result.isNotEmpty) {
        return result[0]['rate'] as double; // Return the rate
      }
      return null; // Return null if no default method is set
    }

    ///Get Open day Table
    Future<List<Map<String, dynamic>>> getOpenDay() async {
      final db = await initDB(); // Initialize the database
        return await db.rawQuery('''
          SELECT openDay.*
          FROM openDay
        ''');
    }

    Future<int> getlatestFiscalDay() async {
      final db = await initDB();
      List<Map<String, dynamic>> result = await db.rawQuery(
        "SELECT FiscalDayNo FROM OpenDay ORDER BY ID DESC LIMIT 1");
      if(result.isNotEmpty){
        return result.first["FiscalDayNo"] as int;
      }
      return 1;
    }
    Future<int> getLatestReceiptGlobalNo() async {
      final db = await initDB();
      List<Map<String, dynamic>> result = await db.rawQuery(
        "SELECT receiptGlobalNo FROM submittedReceipts ORDER BY receiptGlobalNo DESC LIMIT 1"
      );

      if (result.isNotEmpty) {
        return result.first["receiptGlobalNo"] as int;
      }
        return 1; // Default value if no records exist
      }
    Future<int> getNextReceiptCounter(int fiscalDayNo) async {
      final db = await initDB();
      List<Map<String, dynamic>> result = await db.rawQuery(
        '''
          SELECT MAX(receiptCounter) as lastCounter
          FROM submittedReceipts 
          WHERE FiscalDayNo = ?
        ''',
        [fiscalDayNo],
      );

      // Retrieve the counter from the result
      int nextCounter = (result.isNotEmpty && result.first['lastCounter'] != null) 
        ? result.first['lastCounter'] + 1 
        : 1;
      // Default value if no records exist
      return nextCounter;
    }
    //free
    Future<String> getLatestReceiptHash() async {
      final db = await initDB();
      List<Map<String, dynamic>> result = await db.rawQuery(
        "SELECT receiptHash FROM submittedReceipts ORDER BY receiptGlobalNo DESC LIMIT 1"
      );

      if (result.isNotEmpty) {
        return result.first["receiptHash"] ?? "";
      }
      return ""; // Return empty string if no record is found
    }
    //Get Submitted Receipts table
    Future <List<Map<String, dynamic>>> getSubmittedReceipts() async {
      final db = await initDB();
      return await db.rawQuery('''
        SELECT submittedReceipts.*
        FROM submittedReceipts
      ''');
    }

    //Get receipts by date
    Future<List<Map<String, dynamic>>> getReceiptsByDate() async {
      final db = await initDB();
      return await db.rawQuery('''
        SELECT 
          DATE(receiptDate) as sale_day,
          SUM(SalesAmountwithTax) as total_sales
          FROM submittedReceipts
          GROUP BY sale_day
          ORDER BY sale_day ASC;
      ''');
    }

    ///Get All Users From DB
    Future<List<Map<String, dynamic>>> getAllUsers() async {
      final db = await initDB(); // Initialize the database
        return await db.rawQuery('''
          SELECT users.*
          FROM users
        ''');
    }
    ///Get All Users From DB
    Future<List<Map<String, dynamic>>> getCompanyDetails() async {
      final db = await initDB(); // Initialize the database
        return await db.rawQuery('''
          SELECT companyDetails.*
          FROM companyDetails
        ''');
    }
    //////Update Product Stock Quantity
    Future<void> updateProductStockQty(int productid , int newStockQty) async{
      final db = await initDB();
      await db.update(
        'products',
        {'stockQty': newStockQty},
        where: 'productid = ?',
        whereArgs: [productid]
      );
    }

    ////UPdate stock purchase quantity
    Future<void> updateStockPurchaseQty(int purchaseId , int newStockQty) async{
      final db = await initDB();
      await db.update(
        'stockPurchases',
        {'quantity': newStockQty},
        where: 'purchaseId = ?',
        whereArgs: [purchaseId]
      );
    }

    //Get Stock Purchase by id
    Future<List<Map<String , dynamic>>> getStockPurchaseById(int purchaseId) async{
      final db = await initDB();
      return await db.rawQuery('''
        SELECT stockPurchases.*
        FROM stockPurchases
        WHERE purchaseId = ?
      ''' , [purchaseId]);
    }

    //update product
    Future<void> updateProduct(int productid, String name, String barcode , String hscode , String costPrice,
      String sellingPrice, String tax) async{
      final db = await initDB();
      await db.update(
        'products',
        {
          'productName': name,
          'barcode': barcode,
          'hsCode': hscode,
          'costPrice': costPrice,
          'sellingPrice': sellingPrice,
          'tax': tax
        },
        where: 'productid = ?',
        whereArgs: [productid]
      );
    }
    //Set Default Currency
    Future<void> setDefaultCurrency(int methodId , int defaultTag)async{
      final db = await initDB();
      await db.update(
        'paymentMethods',
        {'defaultMethod': defaultTag},
        where: 'payMethodId = ?',
        whereArgs: [methodId]
      );
    }
    ///// Get all Products
    Future<List<Map<String, dynamic>>> getAllProducts() async{
      final db = await initDB();
      return await db.rawQuery('''
        SELECT products.*
        FROM products
      ''');
    }

    //// Get Stock Purchases
    Future<List<Map<String ,dynamic>>> getAllStockPurchases() async{
      final db = await initDB();
      return await db.rawQuery('''
        SELECT stockPurchases.*
        FROM stockPurchases
      ''');
    }

    //// Get Payment Methods
    Future<List<Map<String ,dynamic>>> getPaymentMethods() async{
      final db = await initDB();
      return await db.rawQuery('''
        SELECT paymentMethods.*
        FROM paymentMethods
      ''');
    }

    //Get all customers

    Future<List<Map<String, dynamic>>> getAllCustomers() async {
      final db = await initDB();
      return await db.rawQuery('''
        SELECT customer.*
        FROM customer
      ''');
    }

    Future<Map<String, dynamic>?> getProductByBarcode(String barcode) async {
    final db = await initDB();
    final result = await db.query(
      'products',
      where: 'barcode = ?',
      whereArgs: [barcode],
    );
    return result.isNotEmpty ? result.first : null;
  }

  Future<Map<String, int>> getPreviousReceiptData() async {
    final db = await initDB();
    List<Map<String, dynamic>> result = await db.rawQuery(
        "SELECT receiptCounter, FiscalDayNo, receiptGlobalNo FROM SubmittedReceipts ORDER BY receiptGlobalNo DESC LIMIT 1");
    return result.isNotEmpty
        ? {
            "receiptCounter": result.first["receiptCounter"],
            "FiscalDayNo": result.first["FiscalDayNo"],
            "receiptGlobalNo": result.first["receiptGlobalNo"]
          }
        : {"receiptCounter": 0, "FiscalDayNo": 0, "receiptGlobalNo": 0};
  }
  Future<int> getPreviousFiscalDayNo() async {
    final db = await initDB();
    List<Map<String, dynamic>> result = await db.rawQuery(
        "SELECT FiscalDayNo FROM OpenDay ORDER BY ID DESC LIMIT 1");
    return result.isNotEmpty ? result.first["FiscalDayNo"] : 0;
  }
  Future<void> insertOpenDay(
      int fiscalDayNo, String status, String fiscalDayOpened) async {
    final db = await initDB();
    await db.insert(
      'OpenDay',
      {
        'FiscalDayNo': fiscalDayNo,
        'StatusOfFirstReceipt': status,
        'FiscalDayOpened': fiscalDayOpened,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<void> updateDatabase(Map<String, int> taxIDs) async {
  try {
    final db = await initDB();

    // Get latest record ID
    List<Map<String, dynamic>> result =
        await db.rawQuery("SELECT ID FROM OpenDay ORDER BY id DESC LIMIT 1");

    if (result.isNotEmpty) {
      int id = result.first["ID"];

      // Update the OpenDay table
      await db.update(
        'OpenDay',
        {
          'TaxExempt': taxIDs['Exempt'] ?? 0,
          'TaxZero': taxIDs['Zero'] ?? 0,
          'Tax15': taxIDs['VAT15'] ?? 0,
          'TaxWT': taxIDs['WT'] ?? 0,
        },
        where: 'ID = ?',
        whereArgs: [id],
      );

      print("Applicable Tax IDs Set in DB !!");
    } else {
      print("No records found in OpenDay table");
    }
  } catch (e) {
    print("Database update error: $e");
  }
}

  Future<List<Map<String,dynamic>>> getReceiptsPending() async{
      final db = await initDB();
      return await db.rawQuery('''
        SELECT submittedReceipts.*
        FROM submittedReceipts
        WHERE submittedReceipts.StatustoFDMS = 'NOTSubmitted'
      ''');
  }
    Future<List<Map<String,dynamic>>> getReceiptsSubmitted() async{
      final db = await initDB();
      return await db.rawQuery('''
        SELECT submittedReceipts.*
        FROM submittedReceipts
        WHERE submittedReceipts.StatustoFDMS = 'Submitted'
      ''');
    }

  Future<List<Map<String,dynamic>>> getAllReceipts() async{
      final db = await initDB();
      return await db.rawQuery('''
        SELECT submittedReceipts.*
        FROM submittedReceipts
      ''');
  }

  //get unsubmitted receipts
  Future<List<Map<String,dynamic>>> getReceiptsNotSubmitted() async{
      final db = await initDB();
      return await db.rawQuery('''
        SELECT submittedReceipts.*
        FROM submittedReceipts
        WHERE submittedReceipts.StatustoFDMS = 'NOTSubmitted'
      ''');
  }

  Future<List<Map<String,dynamic>>> getReceiptsSubmittedToday(int dayNo) async{
      final db = await initDB();
      return await db.rawQuery('''
          SELECT submittedReceipts.*
          FROM submittedReceipts 
          WHERE FiscalDayNo = ?
      ''', [dayNo]);
  }

  Future<List<Map<String , dynamic>>> getReceiptSubmittedById(int invoiceNum) async{
    final db = await initDB();
    return await db.rawQuery('''
      SELECT submittedReceipts.*
      FROM submittedReceipts
      WHERE InvoiceNo = ?
    ''' , [invoiceNum]);
  }

  //get day opened date
  Future<List<Map<String , dynamic>>> getDayOpenedDate(int fiscDay) async{
    final db = await initDB();
    return await db.rawQuery('''
      SELECT openDay.*
      FROM openDay
      WHERE FiscalDayNo = ?
    ''',[fiscDay]);
  }

  //get creditnote numbers

  Future<String> getNextCreditNoteNumber() async{
    final db = await initDB();
    final result = await db.rawQuery('SELECT MAX(creditNoteNumber) as maxCr FROM credit_notes');
    final maxCr = result.first['maxCr'] as String?;
    int nextNumber = 1;

    if (maxCr != null) {
      // Extract the numeric part by removing the 'cr' prefix
      final numberPart = int.tryParse(maxCr.replaceFirst('cr', ''));
      if (numberPart != null) {
        nextNumber = numberPart + 1;
      }
    }

    // Format the new credit note number
    return 'cr$nextNumber';
  }

  //get call cancelled Receipts
  Future<List<Map<String,dynamic>>> getAllCancelledInvoices() async{
      final db = await initDB();
      return await db.rawQuery('''
        SELECT credit_notes.*
        FROM credit_notes
      ''');
  }
  Future<List<Map<String, dynamic>>> getAnomalyTable() async{
    final db = await initDB();
    return await db.rawQuery('''
      SELECT receiptAnomallies.*
      FROM receiptAnomallies
    ''');
  }

  Future<List<Map<String, dynamic>>> getFlaggedReceipts() async{
    final db = await initDB();
    return await db.rawQuery('''
      SELECT receiptAnomallies.*
      FROM receiptAnomallies
      WHERE isAnomaly = 'true'
    ''');
  }


  Future<List<Map<String, dynamic>>> getCloseDayReceipts(int fiscalDayOpened) async{
    final db = await initDB();
    return await db.query(
      'submittedReceipts',
      columns: ['receiptType','receiptJsonbody'],
      where: 'FiscalDayNo = ?',
      whereArgs: [fiscalDayOpened],
    );
  }

  Future<List<Map<String , dynamic>>> getReceiptsADetection() async {
    final db = await initDB();
    return await db.query(
      'submittedReceipts',
      columns: ['receiptGlobalNo' , 'receiptJsonbody']
    );
  }

  Future<List<Map<String, dynamic>>> getAllFiscalInvoice() async{
    final db = await initDB();
    return await db.rawQuery(
      '''
        SELECT submittedReceipts.*
        FROM submittedReceipts
        WHERE receiptType = 'FISCALINVOICE'
      '''
    );
  }


  Future<List<Map<String , dynamic>>> getTotalTaxAmount() async{
    final db = await initDB();
    return await db.rawQuery('''
      SELECT SUM(taxAmount) as totalTaxAmount
      FROM submittedReceipts
    ''');
  }

  Future<List<Map<String, dynamic>>> getTopProductsByQuantity() async {
    final database = await initDB();
    return await database.rawQuery('''
      SELECT 
        products.productId,
        products.productName,
        SUM(sales.quantity) as totalQuantity,
        SUM(sales.quantity * sales.sellingPrice) as totalSales
      FROM 
        sales
      INNER JOIN 
        products ON sales.productId = products.productId
      WHERE 
        sales.tax > 0.0
      GROUP BY 
        sales.productId
      ORDER BY 
        totalQuantity DESC
      LIMIT 2
    ''');
  }

    Future<Map<String, dynamic>> getCurrentMonthTaxDetails() async {
    final Database database = await initDB();
    final DateTime now = DateTime.now();
    final int currentYear = now.year;
    final int currentMonth = now.month;
    final String monthName = DateFormat('MMMM').format(now);
    
    // Format for SQL substring comparison
    final String yearMonthPattern = '${currentYear}-${currentMonth < 10 ? '0$currentMonth' : currentMonth}';
    
    // First and last day formatting for display purposes
    final DateTime firstDay = DateTime(currentYear, currentMonth, 1);
    final DateTime lastDay = DateTime(currentYear, currentMonth + 1, 0);
    final String startDateFormatted = DateFormat('yyyy-MM-dd').format(firstDay);
    final String endDateFormatted = DateFormat('yyyy-MM-dd').format(lastDay);
    
    // Query using substring to extract year-month part from ISO timestamp
    final List<Map<String, dynamic>> result = await database.rawQuery('''
      SELECT 
        SUM(taxAmount) as totalTaxAmount,
        COUNT(*) as receiptCount,
        AVG(taxAmount) as averageTaxAmount,
        SUM(SalesAmountwithTax) as totalSalesWithTax,
        SUM(TotalExempt) as totalExempt,
        SUM(TotalWT) as totalWithholdingTax
      FROM submittedReceipts
      WHERE substr(receiptDate, 1, 7) = ?
    ''', [yearMonthPattern]);
    
    final Map<String, dynamic> taxDetails = {
      'totalTaxAmount': result.first['totalTaxAmount'] as double? ?? 0.0,
      'receiptCount': result.first['receiptCount'] as int? ?? 0,
      'averageTaxAmount': result.first['averageTaxAmount'] as double? ?? 0.0,
      'totalSalesWithTax': result.first['totalSalesWithTax'] as double? ?? 0.0,
      'totalExempt': result.first['totalExempt'] as double? ?? 0.0,
      'totalWithholdingTax': result.first['totalWithholdingTax'] as double? ?? 0.0,
      'month': monthName,
      'year': currentYear.toString(),
      'startDate': startDateFormatted,
      'endDate': endDateFormatted,
    };
    
    return taxDetails;
  }

}