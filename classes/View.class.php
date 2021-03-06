<?php
/**
 * View abstraction for handling markup and tempates
 *
 * Handling of page rendering and output
 * @package LazyStructure
 */
class View
{
    private $root = TEMPLATES_PATH; // top level templates directory
    private $name;                // template folder name within the root
    private $path;                // path to template folder
    private $templates = array(); // holds template filenames
    private $vars = array();      // any values to use in a template

    /**
     * Constructor for the view
     *
     * Initializes the view
     *
     * @param string $name template folder name within the root
     * @param string $template an initial template file to load
     * @param string $root top level templates directory - default "templates/"
     */
    public function __construct($name, $template=false, $root=false)
    {
        if(is_null($name))
            trigger_error("You didn't provide your view with a root directory.<br />
                           For example,<br />
                           new PageTemplate(); // BAD<br />
                           new PageTemplate('index'); // GOOD
                          ", E_USER_WARNING);
        $this->name = $name;
        if($root)
            $this->root = $root;
        $this->path = $this->root.$this->name.'/';
        if($template)
            $this->addTemplate($template);
    }

    /**
     * Getter magic method
     *
     * Returns the corresponding element in the vars array
     *
     * @param string $name name of the variable - index of the array
     * @return variable value, or false if not set.
     */
    public function &__get($name)
    {
        return $this->vars[$name];
    }

    /**
     * Setter magic method
     * 
     * Sets the corresponding var array value
     *
     * @param string $name name of the variable - index of the array
     * @param mixed $value the value to store in the array
     */
    public function __set($name, $value)
    {
        $this->vars[$name] = $value;
    }

    /**
     * Return the root value
     *
     * __get() is used for view variable access, so $this->root requires its own getter
     *
     * @return string root value
     */
    public function getRoot()
    {
        return $this->root;
    }

    /**
     * Add a template to be rendered
     *
     * Pass a template file name to append to the array of templates to be rendered
     * upon a call to $view->render()
     *
     * @param string $template template file name
     * @param string $path overload the template path
     */
    public function addTemplate($template, $path=false)
    {
        if(!$path)
            $path = $this->path;
        $this->templates[] = FILE_PATH.$path.$template;
    }

    /**
     * Render the view
     *
     * Outputs all the templates added to the view, in sequential order
     */
    public function render()
    {
        ob_start();
        foreach($this->templates AS $template)
        {
            if(file_exists($template))
                include $template;
            else
                trigger_error("Template $template does not exist.", E_USER_WARNING);
        }
    }

    /**
     * Get the total amount of templates added to the view
     *
     * Count and return the number of templates that have been added to the view
     * @return int number of templates
     */
    public function countTemplates()
    {
        return count($this->templates);
    }

    public function getElement($array, $index)
    {
        if(isset($array[$index]))
            return $array[$index];
        else
            return false;
    }
}
?>
