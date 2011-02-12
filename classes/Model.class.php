<?php
/**
 * Database abstraction for queries and SQL files
 *
 * Handler for SQL queries
 * @package LazyStructure
 */
class Model extends Database
{
    static $instance;

    private $root = 'sql/'; // top level sql file directory
    private $path;          // path to sql folder
    private $name;          // specific folder within the root
    private $vars;          // array of values to be used by the model sql files

    /**
     * Make the database connection
     *
     * Calls to the parent Database::connect
     */
    protected function __construct()
    {
        parent::__construct();
    }

    /**
     * Getter magic method for vars array
     *
     * Returns the corresponding value from the vars array
     *
     * @param string $name name/index of the var value
     * @return var value, or false if not set
     */
    public function __get($name)
    {
        return isset($this->vars[$name]) ? $this->vars[$name] : false;
    }

    /**
     * Setter magic method
     *
     * Sets the corresponding value in the vars array
     *
     * @param string $name name/index of the var value
     * @param mixed $value value to store
     */
    public function __set($name, $value)
    {
        $this->vars[$name] = $value;
    }

    /**
     * Execute an SQL statement and return the result
     *
     * Reads in an SQL file and executes it by passing the corresponding
     * value to Database::query.
     *
     * @param string $file SQL file name
     * @return 
     * - two-dimensional array if successful
     * - false if the query fails
     * - insertion ID on successful insert
     * - number of rows affected on successful update/delete
     */
    public function query($file)
    {
        $args = func_get_args();
        $this->prepQuery($file, $query, $args);
        return parent::query($query, $args);
    }

    /**
     * Execute an SQL statement and return the resulting row
     *
     * Reads in an SQL file and executes it by passing the corresponding value to Database::queryRow.
     *
     * @param string $file SQL file name
     */
    public function queryRow($file)
    {
        $args = func_get_args();
        $this->prepQuery($file, $query, $args);
        return parent::queryRow($query, $args);
    }

    /**
     * Execute an SQL statement and return the resulting column
     *
     * Reads in an SQL file and executes it by passing the corresponding value to Database::queryColumn.
     *
     * @param string $file SQL file name
     */
    public function queryColumn($file)
    {
        $args = func_get_args();
        $this->prepQuery($file, $query, $args);
        return parent::queryColumn($query, $args);
    }

    /**
     * Execute an SQL statement and return the resulting value indexed on the given key
     *
     * Reads in an SQL file and executes it by passing the corresponding value to Database::queryKey.
     *
     * @param string $key column on which to index the values
     * @param string $file SQL file name
     */
    public function queryKey($key, $file)
    {
        $args = func_get_args();
        $this->prepQuery($file, $query, $args);
        array_shift($args);
        return parent::queryKey($key, $query, $args);
    }

    /**
     * Prepare query and arguments to pass to the Database query functions
     *
     * Reads in the SQL statement from the given file
     * stores the value in $query
     * adjusts the arguments by removing the first element if it's an array, and stores it in $args
     *
     * @param string $file SQL file name
     * @param string &$query reference at which to store the SQL query
     * @param array &$args array reference at which to store the query parameters
     */
    private function prepQuery($file, &$query, &$args)
    {
        ob_start();
        require(dirname(__FILE__).'/../'.$this->path.$file);
        $query = ob_get_clean();
        if(is_array($args))
            array_shift($args);
    }

    /**
     * Set the appropriate path values and resets variables
     *
     * Sets the name and path, and resets the vars array.
     * Should be called before use of the object.
     *
     * @param string $name specific folder within root
     */
    public function init($name)
    {
        $this->name = $name;
        $this->path = $this->root.$this->name.'/';
        $this->vars = array();
    }

    /**
     * Get the model object
     *
     * Get the model object if it exists, and create it if it doesn't (singleton pattern)
     */
    public static function getModel()
    {
        if(isset(self::$instance))
            return self::$instance;
        else
            return self::$instance = new Model();
    }
}
?>
